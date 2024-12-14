import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useResume = (userId: string) => {
  const { toast } = useToast();
  const [resumeText, setResumeText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const analyzeResume = async (text: string, existingKeywords: string[] = []) => {
    if (!text) return;
    
    try {
      console.log('Analyzing resume text:', text.substring(0, 100) + '...');
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
      const keywordList = data.keywords.split(',').map((k: string) => k.trim());
      setKeywords(keywordList);
      
      // Update keywords in database
      const { error: updateError } = await supabase
        .from("users")
        .update({ keywords: keywordList })
        .eq("id", userId);

      if (updateError) throw updateError;

      setRetryCount(0);
      toast({
        title: "Success",
        description: "Keywords have been updated.",
      });
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

  const handleSaveResume = async () => {
    setIsSaving(true);
    try {
      const { data: userData, error: fetchError } = await supabase
        .from("users")
        .select("keywords")
        .eq("id", userId)
        .single();

      if (fetchError) throw fetchError;

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

      // Only analyze if there are no existing keywords
      if (!userData?.keywords?.length) {
        setIsAnalyzing(true);
        await analyzeResume(resumeText);
      }
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

  const handleReanalyze = async () => {
    if (!resumeText || isAnalyzing) return;
    
    setIsAnalyzing(true);
    await analyzeResume(resumeText, keywords);
  };

  const handleDeleteResume = async () => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ 
          resume_text: null, 
          resume_file_path: null,
          keywords: [] 
        })
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
    handleReanalyze,
  };
};