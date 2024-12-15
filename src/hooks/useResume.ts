import { useState } from "react";
import { useKeywordAnalysis } from "./useKeywordAnalysis";
import { useResumeActions } from "./useResumeActions";
import { useUserData } from "./useUserData";

export const useResume = (userId: string) => {
  const [resumeText, setResumeText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { isAnalyzing, keywords, setKeywords, handleReanalyze } = useKeywordAnalysis(userId);
  const { saveResume, deleteResume } = useResumeActions(userId);

  const handleSaveResume = async () => {
    setIsSaving(true);
    try {
      const shouldAnalyze = await saveResume(resumeText);
      setIsEditing(false);

      // Only analyze if there are no existing keywords
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
      setResumeText(""); // Only clear the resume text, keep the keywords intact
    }
  };

  const handleResumeTextChange = (text: string) => {
    setResumeText(text);
  };

  // Load initial data and handle keywords separately
  const { isLoading } = useUserData(
    userId, 
    (loadedText) => {
      if (loadedText) {
        setResumeText(loadedText);
      }
    },
    (loadedKeywords) => {
      if (loadedKeywords && loadedKeywords.length > 0) {
        console.log('Setting initial keywords:', loadedKeywords);
        setKeywords(loadedKeywords);
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
    setIsEditing,
    handleSaveResume,
    handleDeleteResume,
    handleResumeTextChange,
    handleReanalyze: () => handleReanalyze(resumeText),
  };
};