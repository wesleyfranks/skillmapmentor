import { supabase } from '../../../client';
import { toast } from 'sonner';
import { handleError } from '../../../../../helpers/handleError';

/**
 * Deletes all keywords for a specific resume.
 * @param userId - The ID of the user.
 * @param resumeId - The ID of the resume.
 */
export const deleteResumesTableKeywords = async (
  userId: string,
  resumeId: string
): Promise<boolean> => {
  console.log('[deleteAllKeywords] Start:', { userId, resumeId });

  try {
    // Update the keywords array to an empty array
    const { error } = await supabase
      .from('resumes')
      .update({
        keywords: [],
        updated_at: new Date().toISOString(), // Update the timestamp
      })
      .eq('id', resumeId)
      .eq('user_id', userId);

    if (error) {
      console.error('[deleteAllKeywords] Update failed:', error);
      throw error;
    }

    console.log('[deleteAllKeywords] All keywords deleted successfully');
    toast.success('All keywords deleted successfully');
    return true;
  } catch (error) {
    handleError(error, '[deleteAllKeywords] Failed to delete keywords');
    return false;
  }
};