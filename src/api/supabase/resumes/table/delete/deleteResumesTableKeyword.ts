import { supabase } from '../../../client';
import { toast } from 'sonner';
import { handleError } from '../../../../../helpers/handleError';

/**
 * Deletes a specific keyword from the keywords array in the resumes table.
 * @param userId - The ID of the user.
 * @param resumeId - The ID of the resume.
 * @param keyword - The keyword to delete.
 */
export const deleteResumesTableKeyword = async (
  userId: string,
  resumeId: string,
  keyword: string
): Promise<boolean> => {
  console.log('[deleteResumesTableKeyword] Start:', {
    userId,
    resumeId,
    keyword,
  });

  try {
    // Fetch the current keywords
    const { data: resume, error: fetchError } = await supabase
      .from('resumes')
      .select('keywords')
      .eq('id', resumeId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('[deleteResumesTableKeyword] Fetch failed:', fetchError);
      throw fetchError;
    }

    if (!resume?.keywords) {
      console.warn('[deleteResumesTableKeyword] No keywords found for resume.');
      return false;
    }

    // Remove the specified keyword from the array
    const updatedKeywords = resume.keywords.filter(
      (k: string) => k !== keyword
    );

    // Update the keywords array in the database
    const { error: updateError } = await supabase
      .from('resumes')
      .update({
        keywords: updatedKeywords,
        updated_at: new Date().toISOString(), // Update the timestamp
      })
      .eq('id', resumeId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('[deleteResumesTableKeyword] Update failed:', updateError);
      throw updateError;
    }

    console.log(
      '[deleteResumesTableKeyword] Keyword deleted successfully:',
      keyword
    );
    toast.success('Keyword deleted successfully');
    return true;
  } catch (error) {
    handleError(error, '[deleteResumesTableKeyword] Failed to delete keyword');
    return false;
  }
};