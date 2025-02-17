import { supabase } from '../../../client';
import { toast } from 'sonner';
import { handleError } from '../../../../../helpers/handleError';

export const updateResumesTableUserResume = async (
  userId: string,
  resumeId: string,
  resumeText?: string,
  keywords?: string[]
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('resumes')
      .update({
        resume_text: resumeText, // updated column name
        keywords,
        updated_at: new Date().toISOString(),
      })
      .eq('id', resumeId)
      .eq('user_id', userId);

    if (error) throw error;
    toast('Resume updated successfully');
    return true;
  } catch (error) {
    handleError(error, 'Failed to update resume');
    return false;
  }
};
