import {
  updateResumesTableUserResume,
  deleteResumesTableUserSingleResume,
  deleteResumesTableUserDeleteMultipleKeywords,
  deleteResumesTableUserDeleteSingleKeyword,
} from '@/api/supabase/resumes/resumes';
import { toast } from 'sonner';

// Ensure proper error handling and consistent behavior
export const useResumeActions = (resumeId: string, userId: string) => {
  if (!userId) {
    throw new Error('User ID is required.');
  }

  // Centralized error handler
  const handleError = (action: string, error: any) => {
    console.error(`Error during ${action}:`, error);
    toast.error(`Failed to ${action}. Please try again.`);
  };

  // Save updated resume text
  const saveResume = async (resumeText: string): Promise<boolean> => {
    if (!resumeId) {
      toast.error('Resume ID is required to save.');
      return false;
    }

    try {
      const success = await updateResumesTableUserResume(
        userId,
        resumeId,
        resumeText
      );
      if (success) {
        toast.success('Resume saved successfully');
      }
      return success;
    } catch (error) {
      handleError('save resume', error);
      return false;
    }
  };

  // Delete a specific resume
  const deleteResume = async (): Promise<boolean> => {
    if (!resumeId) {
      toast.error('Resume ID is required to delete.');
      return false;
    }

    try {
      const success = await deleteResumesTableUserSingleResume(
        userId,
        resumeId
      );
      if (success) {
        toast.success('Resume deleted successfully');
      }
      return success;
    } catch (error) {
      handleError('delete resume', error);
      return false;
    }
  };

  // Delete a specific keyword from a resume
  const deleteKeyword = async (keyword: string): Promise<boolean> => {
    if (!resumeId) {
      toast.error('Resume ID is required to delete a keyword.');
      return false;
    }

    try {
      const success = await deleteResumesTableUserDeleteSingleKeyword(
        keyword,
        resumeId,
        userId
      );
      if (success) {
        toast.success('Keyword deleted successfully');
      }
      return success;
    } catch (error) {
      handleError('delete keyword', error);
      return false;
    }
  };

  // Clear all keywords from a resume
  const clearAllKeywords = async (): Promise<boolean> => {
    if (!resumeId) {
      toast.error('Resume ID is required to clear keywords.');
      return false;
    }

    try {
      const success = await deleteResumesTableUserDeleteMultipleKeywords(
        resumeId,
        userId
      );
      if (success) {
        toast.success('Keywords cleared successfully');
      }
      return success;
    } catch (error) {
      handleError('clear keywords', error);
      return false;
    }
  };

  return {
    saveResume,
    deleteResume,
    deleteKeyword,
    clearAllKeywords,
  };
};
