import { useUserData } from "./useUserData";
import { useResumeText } from "./useResumeText";
import { useKeywords } from "./useKeywords";

export const useResume = (userId: string) => {
  const { data: userData, isLoading, refetch } = useUserData(userId);
  const { isEditing, isSaving, setIsEditing, saveResume, deleteResume } = useResumeText(userId);
  const { isAnalyzing, analyzeResume, updateKeywords, deleteKeywords } = useKeywords(userId);

  const handleSaveResume = async (text: string) => {
    console.log('[useResume] Saving resume');
    const success = await saveResume(text);
    if (success) {
      await refetch();
      await analyzeResume(text, userData?.keywords || []);
    }
  };

  const handleDeleteResume = async () => {
    console.log('[useResume] Deleting resume');
    const success = await deleteResume();
    if (success) await refetch();
  };

  const handleDeleteKeywords = async () => {
    console.log('[useResume] Deleting keywords');
    const success = await deleteKeywords();
    if (success) await refetch();
  };

  const handleUpdateKeywords = async (newKeywords: string[]) => {
    console.log('[useResume] Updating keywords');
    const success = await updateKeywords(newKeywords);
    if (success) await refetch();
  };

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
    handleDeleteResume,
    handleDeleteKeywords,
    handleResumeTextChange: (text: string) => {
      console.log('[useResume] Text changed:', { length: text.length });
    },
    handleReanalyze: () => analyzeResume(userData?.resume_text || "", userData?.keywords || []),
    handleUpdateKeywords,
  };
};