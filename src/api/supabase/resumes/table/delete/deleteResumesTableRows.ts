import { supabase } from '../../../client';
import { handleError } from '../../../../../helpers/handleError';
import { toast } from 'sonner';

/**
 * Deletes a single resume row from the resumes table.
 * @param userId - The ID of the user performing the operation.
 * @param resumeId - The ID of the resume to be deleted.
 * @returns A Promise<boolean> indicating whether the deletion was successful.
 */
export const deleteResumesTableRows = async (
  userId: string,
  resumeId: string
): Promise<boolean> => {
  console.log('[deleteResumesTableRows] Start:', { userId, resumeId });

  try {
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', resumeId)
      .eq('user_id', userId);

    if (error) {
      console.error('[deleteResumesTableRows] Deletion failed:', error);
      throw error;
    }

    console.log('[deleteResumesTableRows] Row deleted successfully');
    toast.success('Resume deleted successfully');
    return true;
  } catch (error) {
    handleError(error, '[deleteResumesTableRows] Failed to delete row');
    toast.error('Failed to delete resume');
    return false;
  }
};
