import { useUserData } from './useUserData';
import { supabase } from '../integrations/supabase/client'; // Ensure correct import
import { useResumeText } from './useResumeText';
import { useKeywords } from './useKeywords';
import { addToNonKeywords } from '../api/users/mutations';
import { useState, useEffect } from 'react';

export const useResume = (userId: string) => {
  const [resumeText, setResumeText] = useState<string>('');
  const [resumes, setResumes] = useState<any[]>([]); // State to hold multiple resumes
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const { data: userData, isLoading, refetch } = useUserData(userId);
  const { isEditing, isSaving, setIsEditing, saveResume, deleteResume } =
    useResumeText(userId);
  const { isAnalyzing, analyzeResume, updateKeywords, deleteKeywords } =
    useKeywords(userId);

  const fetchResumes = async () => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      setResumes(data || []);
      if (data && data.length > 0) {
        const resumeId = parseInt(data[0].id, 10); // Ensure the ID is a number
        setSelectedResumeId(isNaN(resumeId) ? null : resumeId); // Set to null if ID is invalid
        fetchResumeContent(data[0].file_path);
      }
    } catch (error) {
      console.error('[useResume] Error fetching resumes:', error);
    }
  };

  const fetchResumeContent = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .download(filePath);

      if (error) throw error;

      const text = await data.text(); // Read the text content from the file
      setResumeText(text); // Update the resume text state
    } catch (error) {
      console.error('[useResume] Error fetching resume content:', error);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleSelectResume = (resumeId: number, filePath: string) => {
    setSelectedResumeId(resumeId);
    fetchResumeContent(filePath);
  };

  const handleSaveResume = async (text: string) => {
    console.log('[useResume] Saving resume with text:', text);
    const success = (await saveResume(text)) ?? false; // Ensure it defaults to false if undefined
    if (success) {
      await refetch();
      fetchResumes(); // Refresh the list of resumes
    }
  };

  const handleDeleteResume = async (resumeId: number) => {
    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId);

      if (error) throw error;

      console.log('[useResume] Resume deleted successfully');
      fetchResumes(); // Refresh the list of resumes
    } catch (error) {
      console.error('[useResume] Error deleting resume:', error);
    }
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

  const handleAddToNonKeywords = async (keyword: string) => {
    try {
      console.log('[useResume] Adding to non-keywords:', {
        userId,
        keyword,
        currentKeywords: userData?.keywords || [],
        currentNonKeywords: userData?.non_keywords || [],
      });

      const success = await addToNonKeywords(
        userId,
        keyword,
        userData?.keywords || [],
        userData?.non_keywords || []
      );
      console.log('[useResume] Add to non-keywords success:', success);

      if (success) {
        console.log('[useResume] Refetching data...');
        await refetch();
      }
    } catch (error) {
      console.error('[useResume] Error in handleAddToNonKeywords:', error);
    }
  };

  const handleResumeTextChange = (text: string) => {
    console.log('[useResume] Text changed:', { length: text.length });
    setResumeText(text);
  };

  return {
    resumes,
    selectedResumeId,
    resumeText,
    keywords: userData?.keywords || [],
    nonKeywords: userData?.non_keywords || [],
    isEditing,
    isSaving,
    isAnalyzing,
    isLoading,
    setIsEditing,
    handleSelectResume,
    handleSaveResume,
    handleDeleteResume,
    handleDeleteKeywords,
    handleResumeTextChange,
    handleUpdateKeywords,
    handleAddToNonKeywords,
  };
};
