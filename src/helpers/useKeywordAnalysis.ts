import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/api/supabase/client';

export const useKeywordAnalysis = (userId: string, resumeId: string) => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [nonKeywords, setNonKeywords] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  /**
   * Analyze the resume and extract keywords.
   * @param text - The resume text to analyze.
   * @param existingKeywords - Existing keywords to consider.
   */
  const analyzeResume = async (
    text: string,
    existingKeywords: string[] = []
  ) => {
    if (!text || !resumeId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Resume ID and text are required.',
      });
      return;
    }

    try {
      console.log('[useKeywordAnalysis] Analyzing resume:', resumeId);
      const { data, error } = await supabase.functions.invoke(
        'analyze-resume',
        {
          body: {
            resumeText: text,
            existingKeywords,
            nonKeywords,
          },
        }
      );

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const filteredKeywords: string[] = Array.from(
        new Set(
          (data.keywords as unknown[])
            .map((k) => {
              if (typeof k === 'string') {
                return k.trim();
              }
              console.error(
                `[useKeywordAnalysis] Invalid keyword detected:`,
                k
              );
              return null;
            })
            .filter(Boolean)
        )
      ).filter((k) => k && !nonKeywords.includes(k.toLowerCase()));

      setKeywords(filteredKeywords);

      const { error: updateError } = await supabase
        .from('resumes')
        .update({ keywords: filteredKeywords })
        .eq('id', resumeId)
        .eq('user_id', userId);

      if (updateError) throw updateError;

      setRetryCount(0);

      const newKeywordsCount = data.newKeywordsCount || 0;
      toast({
        title: 'Analysis Complete',
        description: newKeywordsCount
          ? `Found ${newKeywordsCount} new keyword${
              newKeywordsCount === 1 ? '' : 's'
            }!`
          : 'Analysis complete. No new keywords found.',
      });
    } catch (error: any) {
      console.error('[useKeywordAnalysis] Error analyzing resume:', error);
      if (retryCount < MAX_RETRIES) {
        setRetryCount(retryCount + 1);
        console.log(`Retrying... (${retryCount}/${MAX_RETRIES})`);
        await analyzeResume(text, existingKeywords);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error analyzing resume',
          description: error.message,
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Reanalyze the resume with the current text and keywords.
   * @param resumeText - The resume text to reanalyze.
   */
  const handleReanalyze = async (resumeText: string) => {
    if (!resumeText || isAnalyzing) return;
    setIsAnalyzing(true);
    await analyzeResume(resumeText, keywords);
  };

  /**
   * Add a keyword to the non-keywords list.
   * @param keyword - The keyword to add to the non-keywords list.
   */
  const addToNonKeywords = async (keyword: string) => {
    try {
      const lowercaseKeyword = keyword.toLowerCase();
      const updatedNonKeywords = [...nonKeywords, lowercaseKeyword];

      const { error } = await supabase
        .from('resumes')
        .update({
          non_keywords: updatedNonKeywords,
          keywords: keywords.filter(
            (k) => k.toLowerCase() !== lowercaseKeyword
          ),
        })
        .eq('id', resumeId)
        .eq('user_id', userId);

      if (error) throw error;

      setNonKeywords(updatedNonKeywords);
      setKeywords(keywords.filter((k) => k.toLowerCase() !== lowercaseKeyword));

      toast({
        description: `Added "${keyword}" to non-keywords list.`,
      });
    } catch (error) {
      console.error(
        '[useKeywordAnalysis] Error adding to non-keywords:',
        error
      );
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add keyword to non-keywords list.',
      });
    }
  };

  return {
    isAnalyzing,
    keywords,
    nonKeywords,
    setKeywords,
    setNonKeywords,
    handleReanalyze,
    addToNonKeywords,
  };
};
