import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  getResumesTableUserMultipleResumes,
  updateResumesTableUserResume,
  deleteResumesTableUserSingleResume,
} from '../api/supabase/resumes/resumes'; // Import functions from resumes.ts

interface Resume {
  id: string;
  file_path: string;
  resume_text: string;
}

export const useResume = (userId: string) => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch resumes from the database
  const fetchResumes = async () => {
    setIsLoading(true);
    try {
      const data = await getResumesTableUserMultipleResumes(userId);
      setResumes(data || []);
      if (data?.length > 0) {
        setResumeId(data[0].id);
        setResumeText(data[0].resume_text || '');
      }
    } catch (error) {
      console.error('[useResume] Error fetching resumes:', error);
      toast.error('Failed to fetch resumes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [userId]);

  // Update local resume text state
  const handleResumeTextChange = (text: string) => {
    setResumeText(text);
  };

  // Save updated resume text
  const handleSaveResume = async (text: string) => {
    if (!resumeId) {
      toast.error('No resume selected to save.');
      return;
    }

    try {
      setIsSaving(true);
      const success = await updateResumesTableUserResume(
        userId,
        resumeId,
        text
      );
      if (success) {
        toast.success('Resume saved successfully.');
        setIsEditing(false);

        // Update state directly to avoid unnecessary fetch
        setResumes((prev) =>
          prev.map((resume) =>
            resume.id === resumeId ? { ...resume, resume_text: text } : resume
          )
        );
      } else {
        throw new Error('Failed to save resume.');
      }
    } catch (error) {
      console.error('[useResume] Error saving resume:', error);
      toast.error('Failed to save resume.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete a specific resume
  const handleDeleteResume = async (resumeId: string) => {
    try {
      const success = await deleteResumesTableUserSingleResume(
        userId,
        resumeId
      );
      if (success) {
        toast.success('Resume deleted successfully.');

        // Update state directly to avoid unnecessary fetch
        setResumes((prev) => prev.filter((resume) => resume.id !== resumeId));
        setResumeId(null); // Reset selected resume ID
        setResumeText(''); // Clear the resume text
      } else {
        throw new Error('Failed to delete resume.');
      }
    } catch (error) {
      console.error('[useResume] Error deleting resume:', error);
      toast.error('Failed to delete resume.');
    }
  };

  return {
    resumes,
    resumeId,
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
