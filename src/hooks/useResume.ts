import { useState, useEffect } from "react";
import { useKeywordAnalysis } from "./useKeywordAnalysis";
import { useResumeActions } from "./useResumeActions";
import { useUserData } from "./useUserData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useResume = (userId: string) => {
  const [resumeText, setResumeText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasInitialAnalysis, setHasInitialAnalysis] = useState(false);
  
  const { 
    isAnalyzing, 
    keywords, 
    nonKeywords,
    setKeywords, 
    setNonKeywords,
    handleReanalyze,
    addToNonKeywords 
  } = useKeywordAnalysis(userId);
  
  const { saveResume, deleteResume, deleteKeywords } = useResumeActions(userId);

  const { data, isLoading, refetch } = useUserData(
    userId, 
    (loadedText) => {
      console.log('[useResume][Profile][onResumeLoad] Setting resume text from loaded data:', {
        textLength: loadedText?.length,
        hasText: !!loadedText
      });
      if (loadedText) {
        setResumeText(loadedText);
        // Only analyze on initial load if we haven't done it yet and there's no keywords
        if (!hasInitialAnalysis && (!keywords || keywords.length === 0)) {
          console.log('[useResume][Profile][onResumeLoad] Triggering initial analysis');
          handleReanalyze(loadedText);
          setHasInitialAnalysis(true);
        }
      }
    },
    (loadedKeywords, loadedNonKeywords) => {
      if (loadedKeywords && loadedKeywords.length > 0) {
        console.log('[useResume][Profile][onKeywordsLoad] Setting initial keywords:', {
          keywordsCount: loadedKeywords.length
        });
        setKeywords(loadedKeywords);
      }
      if (loadedNonKeywords && loadedNonKeywords.length > 0) {
        console.log('[useResume][Profile][onKeywordsLoad] Setting initial non-keywords:', {
          nonKeywordsCount: loadedNonKeywords.length
        });
        setNonKeywords(loadedNonKeywords);
      }
    }
  );

  // Initialize state from data when it loads
  useEffect(() => {
    if (data) {
      console.log('[useResume][Profile][useEffect] Initializing state from data:', {
        hasResumeText: !!data.resume_text,
        keywordsCount: data.keywords?.length,
        nonKeywordsCount: data.non_keywords?.length
      });

      if (data.resume_text) {
        setResumeText(data.resume_text);
      }
      if (data.keywords) {
        setKeywords(data.keywords);
      }
      if (data.non_keywords) {
        setNonKeywords(data.non_keywords);
      }
    }
  }, [data]);

  const handleSaveResume = async () => {
    console.log('[useResume][Profile][handleSaveResume] Saving resume');
    setIsSaving(true);
    try {
      const shouldAnalyze = await saveResume(resumeText);
      setIsEditing(false);

      if (shouldAnalyze) {
        console.log('[useResume][Profile][handleSaveResume] Initiating resume analysis');
        await handleReanalyze(resumeText);
      }
      
      await refetch();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteResume = async () => {
    console.log('[useResume][Profile][handleDeleteResume] Deleting resume');
    const success = await deleteResume();
    if (success) {
      setResumeText("");
      await refetch();
    }
  };

  const handleDeleteKeywords = async () => {
    console.log('[useResume][Profile][handleDeleteKeywords] Deleting keywords');
    const success = await deleteKeywords();
    if (success) {
      setKeywords([]);
      await refetch();
    }
  };

  const handleResumeTextChange = (text: string) => {
    console.log('[useResume][Profile][handleResumeTextChange] Updating resume text');
    setResumeText(text);
  };

  const handleUpdateKeywords = async (newKeywords: string[]) => {
    console.log('[useResume][Profile][handleUpdateKeywords] Updating keywords:', {
      keywordsCount: newKeywords.length
    });
    try {
      const { error } = await supabase
        .from("users")
        .update({ keywords: newKeywords })
        .eq("id", userId);

      if (error) throw error;
      setKeywords(newKeywords);
      await refetch();
    } catch (error) {
      console.error("[useResume][Profile][handleUpdateKeywords] Error updating keywords:", error);
      toast.error("Failed to update keywords");
    }
  };

  return {
    resumeText,
    isEditing,
    isSaving,
    isAnalyzing,
    keywords,
    isLoading,
    setResumeText,
    setKeywords,
    setIsEditing,
    handleSaveResume,
    handleDeleteResume,
    handleDeleteKeywords,
    handleResumeTextChange,
    handleReanalyze: () => handleReanalyze(resumeText),
    handleUpdateKeywords,
    handleAddToNonKeywords: addToNonKeywords,
  };
};