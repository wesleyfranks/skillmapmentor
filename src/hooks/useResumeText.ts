import { useState } from 'react';
import { supabase } from '../integrations/supabase/client'; // Corrected import path
import { toast } from 'sonner';

export const useResumeText = (userId: string) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const saveResume = async (text: string) => {
    console.log('[useResumeText] Saving resume');
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('resumes') // Change to resumes table
        .update({
          resume_text: text
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Resume saved successfully');
      setIsEditing(false);
      return true;
    } catch (error) {
      console.error('[useResumeText] Error saving resume:', error);
      toast.error('Failed to save resume');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteResume = async (): Promise<boolean> => {
    // Ensure it returns a boolean
    console.log('[useResumeText] Deleting resume');
    try {
      const { error } = await supabase
        .from('resumes') // Change to resumes table
        .update({
          resume_text: null,
          file_path: null,
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Resume deleted successfully');
      return true;
    } catch (error) {
      console.error('[useResumeText] Error deleting resume:', error);
      toast.error('Failed to delete resume');
      return false;
    }
  };

  return {
    isEditing,
    isSaving,
    setIsEditing,
    saveResume,
    deleteResume,
  };
};
