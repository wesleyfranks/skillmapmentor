import { supabase } from '../../../client';
import { handleError } from '../../../../../helpers/handleError';

export const deleteResumesTableUserDeleteMultipleKeywords = async (
  resumeId: string,
  userId: string
): Promise<boolean> => {
  console.log('[deleteResumesTableUserDeleteMultipleKeywords] Start:', {
    resumeId,
    userId,
  });

  try {
    const { error } = await supabase
      .from('resumes')
      .update({
        keywords: [],
      })
      .eq('id', resumeId)
      .eq('user_id', userId);

    if (error) {
      console.error(
        '[deleteResumesTableUserDeleteMultipleKeywords] Update failed:',
        error
      );
      throw error;
    }

    console.log(
      '[deleteResumesTableUserDeleteMultipleKeywords] All keywords cleared successfully'
    );
    return true;
  } catch (error) {
    handleError(
      error,
      '[deleteResumesTableUserDeleteMultipleKeywords] Failed to clear keywords'
    );
    return false;
  }
};
