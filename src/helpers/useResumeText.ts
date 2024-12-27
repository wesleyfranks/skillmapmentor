import { useState } from 'react';
import { supabase } from '../integrations/supabase/client'; // Corrected import path
import { toast } from 'sonner';

export const useResumeText = (userId: string) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const saveResume = async (resumeText: string) => {
    console.log('[useResumeText] Saving resume');
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('resumes') // Change to resumes table
        .update({
          resume_text: resumeText,
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

  const deleteResume = async (resumeId: string): Promise<boolean> => {
    // Ensure it returns a boolean
    console.log('[useResumeText] Deleting resume');
    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId)
        .eq('user_id', userId); // Safety check

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
