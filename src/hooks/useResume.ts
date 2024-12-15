import { useState } from "react";
import { useKeywordAnalysis } from "./useKeywordAnalysis";
import { useResumeActions } from "./useResumeActions";
import { useUserData } from "./useUserData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useResume = (userId: string) => {
  const [resumeText, setResumeText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
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

  const handleSaveResume = async () => {
    setIsSaving(true);
    try {
      const shouldAnalyze = await saveResume(resumeText);
      setIsEditing(false);

      if (shouldAnalyze) {
        await handleReanalyze(resumeText);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteResume = async () => {
    const success = await deleteResume();
    if (success) {
      setResumeText("");
    }
  };

  const handleDeleteKeywords = async () => {
    const success = await deleteKeywords();
    if (success) {
      setKeywords([]);
    }
  };

  const handleResumeTextChange = (text: string) => {
    setResumeText(text);
  };

  const handleUpdateKeywords = async (newKeywords: string[]) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ keywords: newKeywords })
        .eq("id", userId);

      if (error) throw error;
      setKeywords(newKeywords);
    } catch (error) {
      console.error("Error updating keywords:", error);
      toast.error("Failed to update keywords");
    }
  };

  const { isLoading } = useUserData(
    userId, 
    (loadedText) => {
      if (loadedText) {
        setResumeText(loadedText);
      }
    },
    (loadedKeywords, loadedNonKeywords) => {
      if (loadedKeywords && loadedKeywords.length > 0) {
        console.log('Setting initial keywords:', loadedKeywords);
        setKeywords(loadedKeywords);
      }
      if (loadedNonKeywords && loadedNonKeywords.length > 0) {
        console.log('Setting initial non-keywords:', loadedNonKeywords);
        setNonKeywords(loadedNonKeywords);
      }
    }
  );

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