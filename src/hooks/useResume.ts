import { useState } from "react";
import { useKeywordAnalysis } from "./useKeywordAnalysis";
import { useResumeActions } from "./useResumeActions";

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
      setResumeText("");
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
    handleReanalyze: () => handleReanalyze(resumeText),
  };
};