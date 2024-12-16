import { useState } from "react";
import { useUserData } from "./useUserData";
import { useResumeActions } from "./useResumeActions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useResume = (userId: string) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasInitialAnalysis, setHasInitialAnalysis] = useState(false);

  const { data: userData, isLoading, refetch } = useUserData(userId);
  const { saveResume, deleteResume, deleteKeywords } = useResumeActions(userId);

  const handleInitialAnalysis = async (text: string) => {
    if (!hasInitialAnalysis && text && (!userData?.keywords || userData.keywords.length === 0)) {
      console.log('[useResume] Starting initial analysis');
      setIsAnalyzing(true);
      try {
        await handleReanalyze(text);
        setHasInitialAnalysis(true);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleReanalyze = async (text?: string) => {
    const textToAnalyze = text || userData?.resume_text;
    if (!textToAnalyze || isAnalyzing) return;
    
    console.log('[useResume] Starting reanalysis');
    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-resume', {
        body: { 
          resumeText: textToAnalyze,
          existingKeywords: userData?.keywords || [],
          nonKeywords: userData?.non_keywords || []
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      console.log('[useResume] Analysis complete:', data);
      
      const keywordList = Array.from(new Set(
        (data.keywords as string)
          .split(',')
          .map(k => k.trim())
          .filter(k => k && !(userData?.non_keywords || []).includes(k.toLowerCase()))
      )).sort();

      await supabase
        .from("users")
        .update({ keywords: keywordList })
        .eq("id", userId);

      await refetch();
      
      const newKeywordsCount = data.newKeywordsCount || 0;
      if (newKeywordsCount > 0) {
        toast.success(`Found ${newKeywordsCount} new keyword${newKeywordsCount === 1 ? '' : 's'}!`);
      } else {
        toast.info("Analysis complete. No new keywords found.");
      }
    } catch (error: any) {
      console.error('[useResume] Analysis error:', error);
      toast.error(error.message || "Error analyzing resume");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveResume = async (text: string) => {
    console.log('[useResume] Saving resume');
    setIsSaving(true);
    try {
      const shouldAnalyze = await saveResume(text);
      setIsEditing(false);
      await refetch();

      if (shouldAnalyze) {
        await handleReanalyze(text);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateKeywords = async (newKeywords: string[]) => {
    console.log('[useResume] Updating keywords:', {
      keywordsCount: newKeywords.length
    });
    
    try {
      const { error } = await supabase
        .from("users")
        .update({ keywords: newKeywords })
        .eq("id", userId);

      if (error) throw error;
      await refetch();
    } catch (error) {
      console.error('[useResume] Error updating keywords:', error);
      toast.error("Failed to update keywords");
    }
  };

  // If we have userData, trigger initial analysis
  if (userData?.resume_text && !hasInitialAnalysis) {
    handleInitialAnalysis(userData.resume_text);
  }

  return {
    resumeText: userData?.resume_text || "",
    keywords: userData?.keywords || [],
    nonKeywords: userData?.non_keywords || [],
    isEditing,
    isSaving,
    isAnalyzing,
    isLoading,
    setIsEditing,
    handleSaveResume,
    handleDeleteResume: async () => {
      const success = await deleteResume();
      if (success) await refetch();
    },
    handleDeleteKeywords: async () => {
      const success = await deleteKeywords();
      if (success) await refetch();
    },
    handleResumeTextChange: (text: string) => {
      // This will be handled by the form directly
      console.log('[useResume] Text changed:', { length: text.length });
    },
    handleReanalyze: () => handleReanalyze(userData?.resume_text),
    handleUpdateKeywords,
  };
};