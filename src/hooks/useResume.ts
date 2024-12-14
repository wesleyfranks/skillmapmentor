import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useResume = (userId: string) => {
  const { toast } = useToast();
  const [resumeText, setResumeText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);

  const analyzeResume = async (text: string) => {
    if (!text) return;

    setIsAnalyzing(true);
    try {
      console.log('Analyzing resume text:', text.substring(0, 100) + '...');
      const { data, error } = await supabase.functions.invoke('analyze-resume', {
        body: { resumeText: text }
      });

      if (error) {
        // Check if it's a rate limit error
        if (error.status === 429) {
          toast({
            variant: "destructive",
            title: "Rate limit reached",
            description: "Please wait a moment before trying again.",
          });
          return;
        }
        throw error;
      }
      
      if (data.error) throw new Error(data.error);

      console.log('Analysis response:', data);
      const keywordList = data.keywords.split(',').map((k: string) => k.trim());
      setKeywords(keywordList);
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

      analyzeResume(resumeText);
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
    analyzeResume(text);
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