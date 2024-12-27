import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useKeywordAnalysis = (userId: string) => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [nonKeywords, setNonKeywords] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const analyzeResume = async (text: string, existingKeywords: string[] = []) => {
    if (!text) return;
    
    try {
      console.log('Analyzing resume text:', text.substring(0, 100) + '...');
      console.log('Existing keywords:', existingKeywords);
      console.log('Non-keywords:', nonKeywords);

      const { data, error } = await supabase.functions.invoke('analyze-resume', {
        body: { 
          resumeText: text,
          existingKeywords,
          nonKeywords
        }
      });

      if (error) {
        let errorData;
        try {
          if (typeof error.message === 'string' && error.message.includes('{')) {
            errorData = JSON.parse(error.message);
          } else {
            errorData = { error: error.message };
          }
        } catch {
          errorData = { error: error.message };
        }

        if (error.status === 429 || errorData?.error?.includes('Rate limit')) {
          const retryAfterMatch = errorData?.error?.match(/try again in (\d+)ms/);
          const retryAfter = retryAfterMatch ? parseInt(retryAfterMatch[1]) : 3000;
          
          if (retryCount < MAX_RETRIES) {
            setRetryCount(prev => prev + 1);
            toast({
              title: "Rate limit reached",
              description: `Retrying analysis in ${Math.ceil(retryAfter / 1000)} seconds...`,
            });
            
            await new Promise(resolve => setTimeout(resolve, retryAfter + 1000));
            return analyzeResume(text, existingKeywords);
          } else {
            throw new Error("Maximum retry attempts reached. Please try again later.");
          }
        }
        throw error;
      }

      if (data.error) throw new Error(data.error);

      console.log('Analysis response:', data);
      
      // Filter out non-keywords and remove duplicates
      const filteredKeywords = (data.keywords as string)
        .split(',')
        .map(k => k.trim())
        .filter(k => k && !nonKeywords.includes(k.toLowerCase()));
      
      const keywordList = Array.from(new Set(filteredKeywords)).sort();
      
      setKeywords(keywordList);
      
      // Update keywords in database
      const { error: updateError } = await supabase
        .from("resumes")
        .update({ keywords: keywordList })
        .eq("id", userId);

      if (updateError) throw updateError;

      setRetryCount(0);
      
      // Show appropriate toast based on new keywords found
      const newKeywordsCount = data.newKeywordsCount || 0;
      
      if (newKeywordsCount > 0) {
        toast({
          title: "Analysis Complete",
          description: `Found ${newKeywordsCount} new keyword${newKeywordsCount === 1 ? '' : 's'}!`,
        });
      } else {
        toast({
          description: "Analysis complete. No new keywords found.",
        });
      }
    } catch (error: any) {
      console.error('Error analyzing resume:', error);
      toast({
        variant: "destructive",
        title: "Error analyzing resume",
        description: error.message,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReanalyze = async (resumeText: string) => {
    if (!resumeText || isAnalyzing) return;
    setIsAnalyzing(true);
    await analyzeResume(resumeText, keywords);
  };

  const addToNonKeywords = async (keyword: string) => {
    try {
      const lowercaseKeyword = keyword.toLowerCase();
      const updatedNonKeywords = [...nonKeywords, lowercaseKeyword];
      
      const { error } = await supabase
        .from("resumes")
        .update({ 
          non_keywords: updatedNonKeywords,
          keywords: keywords.filter(k => k.toLowerCase() !== lowercaseKeyword)
        })
        .eq("id", userId);

      if (error) throw error;

      setNonKeywords(updatedNonKeywords);
      setKeywords(keywords.filter(k => k.toLowerCase() !== lowercaseKeyword));
      
      toast({
        description: `Added "${keyword}" to non-keywords list.`,
      });
    } catch (error) {
      console.error('Error adding to non-keywords:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add keyword to non-keywords list.",
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
    addToNonKeywords
  };
};