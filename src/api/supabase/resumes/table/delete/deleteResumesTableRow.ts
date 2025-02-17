import { supabase } from '../../../client';
import { handleError } from '../../../../../helpers/handleError';
import { toast } from 'sonner';

/**
 * Deletes a single resume row from the resumes table.
 * @param resumeId - The ID of the resume to delete.
 * @param userId - The ID of the user to verify ownership.
 * @returns A boolean indicating whether the operation was successful.
 */
export const deleteResumesTableRow = async (
  userId: string,
  resumeId: string
): Promise<boolean> => {
  console.log('[deleteResumesTableRow] Start:', { userId, resumeId });

  try {
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', resumeId)
      .eq('user_id', userId);

    if (error) {
      console.error('[deleteResumesTableRow] Deletion failed:', error);
      throw error;
    }

    console.log('[deleteResumesTableRow] Row deleted successfully');
    toast.success('Resume deleted successfully');
    return true;
  } catch (error) {
    handleError(error, '[deleteResumesTableRow] Failed to delete row');
    toast.error('Failed to delete resume');
    return false;
  }
};
