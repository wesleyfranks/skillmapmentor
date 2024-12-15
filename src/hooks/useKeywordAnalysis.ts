import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useKeywordAnalysis = (userId: string) => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const analyzeResume = async (text: string, existingKeywords: string[] = []) => {
    if (!text) return;
    
    try {
      console.log('Analyzing resume text:', text.substring(0, 100) + '...');
      console.log('Existing keywords:', existingKeywords);
      
      // Check if we already have keywords for this exact text
      const textHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
        .then(hash => Array.from(new Uint8Array(hash))
          .map(b => b.toString(16).padStart(2, '0'))
          .join(''));
      
      const { data: userData } = await supabase
        .from("users")
        .select("resume_text")
        .eq("id", userId)
        .single();
      
      // If the resume text is the same as what's stored, don't reanalyze
      if (userData?.resume_text === text && existingKeywords.length > 0) {
        console.log('Resume text unchanged, skipping analysis');
        return;
      }

      const { data, error } = await supabase.functions.invoke('analyze-resume', {
        body: { 
          resumeText: text,
          existingKeywords
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
      
      // Remove duplicates and sort alphabetically
      const keywordList = Array.from(new Set(
        (data.keywords as string).split(',')
          .map((k: string) => k.trim())
      ))
        .filter(Boolean)
        .sort() as string[];
      
      setKeywords(keywordList);
      
      // Update keywords in database
      const { error: updateError } = await supabase
        .from("users")
        .update({ keywords: keywordList })
        .eq("id", userId);

      if (updateError) throw updateError;

      setRetryCount(0);
      
      // Only show toast if new keywords were added
      if (keywordList.length > existingKeywords.length) {
        toast({
          title: "Success",
          description: "New keywords have been added.",
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

  return {
    isAnalyzing,
    keywords,
    setKeywords,
    handleReanalyze
  };
};