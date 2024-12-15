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
      setResumeText(""); // Only clear the resume text, keep the keywords
    }
  };

  const handleResumeTextChange = (text: string) => {
    setResumeText(text);
  };

  // Load initial data
  useUserData(
    userId, 
    handleResumeTextChange,
    (loadedKeywords) => setKeywords(loadedKeywords)
  );

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
    handleReanalyze: () => handleReanalyze(resumeText),
  };
};