import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import debounce from "lodash/debounce";

export const useResume = (userId: string) => {
  const { toast } = useToast();
  const [resumeText, setResumeText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Enhanced analyze function with retry logic
  const analyzeResume = async (text: string) => {
    if (!text) return;
    
    try {
      console.log('Analyzing resume text:', text.substring(0, 100) + '...');
      const { data, error } = await supabase.functions.invoke('analyze-resume', {
        body: { resumeText: text }
      });

      if (error) {
        // Parse error message for rate limit info
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

        // Handle rate limit specifically
        if (error.status === 429 || errorData?.error?.includes('Rate limit')) {
          const retryAfterMatch = errorData?.error?.match(/try again in (\d+)ms/);
          const retryAfter = retryAfterMatch ? parseInt(retryAfterMatch[1]) : 3000;
          
          if (retryCount < MAX_RETRIES) {
            setRetryCount(prev => prev + 1);
            toast({
              title: "Rate limit reached",
              description: `Retrying analysis in ${Math.ceil(retryAfter / 1000)} seconds...`,
            });
            
            // Wait for rate limit + buffer and retry
            await new Promise(resolve => setTimeout(resolve, retryAfter + 1000));
            return analyzeResume(text);
          } else {
            throw new Error("Maximum retry attempts reached. Please try again later.");
          }
        }
        throw error;
      }

      if (data.error) throw new Error(data.error);

      console.log('Analysis response:', data);
      const keywordList = data.keywords.split(',').map((k: string) => k.trim());
      setKeywords(keywordList);
      setRetryCount(0); // Reset retry count on success
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

  // Debounced analyze with increased delay
  const debouncedAnalyze = useCallback(
    debounce(async (text: string) => {
      setIsAnalyzing(true);
      await analyzeResume(text);
    }, 5000), // Increased to 5 seconds to help prevent rate limits
    []
  );

  const handleSaveResume = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ resume_text: resumeText })
        .eq("id", userId);

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: "Success",
        description: "Your resume has been saved.",
      });

      // Only analyze if save was successful
      debouncedAnalyze(resumeText);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving resume",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteResume = async () => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ resume_text: null, resume_file_path: null })
        .eq("id", userId);

      if (error) throw error;

      setResumeText("");
      setKeywords([]);
      toast({
        title: "Success",
        description: "Your resume has been deleted.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting resume",
        description: error.message,
      });
    }
  };

  const handleResumeTextChange = (text: string) => {
    setResumeText(text);
    setRetryCount(0); // Reset retry count when text changes
    debouncedAnalyze(text);
  };

  return {
    resumeText,
    isEditing,
    isSaving,
    isAnalyzing,
    keywords,
    setResumeText,
    setIsEditing,
    handleSaveResume,
    handleDeleteResume,
    handleResumeTextChange,
  };
};