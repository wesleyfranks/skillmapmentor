import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client'; // Adjust the import path
import { toast } from 'sonner';

interface Resume {
  id: string;
  file_path: string;
  resume_text: string;
}

export const useResume = (userId: string) => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchResumes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('id, file_path, resume_text')
        .eq('user_id', userId);
      if (error) throw error;
      setResumes(data || []);
      if (data?.length > 0) {
        setSelectedResumeId(data[0].id);
        setResumeText(data[0].resume_text || '');
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast.error('Failed to fetch resumes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [userId]);

  const handleResumeTextChange = (text: string) => {
    setResumeText(text);
  };

  const handleSaveResume = async (text: string) => {
    if (!selectedResumeId) {
      toast.error('No resume selected to save.');
      return;
    }

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('resumes')
        .update({ resume_text: text })
        .eq('id', selectedResumeId);
      if (error) throw error;
      toast.success('Resume saved successfully.');
      setIsEditing(false);
      fetchResumes(); // Refresh resumes
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId);
      if (error) throw error;
      toast.success('Resume deleted successfully.');
      fetchResumes(); // Refresh resumes
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume.');
    }
  };

  return {
    resumes,
    selectedResumeId,
    resumeText,
    isEditing,
    isSaving,
    isLoading,
    setIsEditing,
    handleSaveResume,
    handleDeleteResume,
    handleResumeTextChange,
  };
};
