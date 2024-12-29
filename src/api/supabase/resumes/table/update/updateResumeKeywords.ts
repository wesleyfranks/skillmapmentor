import { supabase } from '../../../client';
import { handleError } from '../../../../../helpers/handleError';

export const deleteResumesTableUserDeleteSingleKeyword = async (
  keyword: string,
  resumeId: string,
  userId: string
): Promise<boolean> => {
  console.log('[deleteResumesTableUserDeleteSingleKeyword] Start:', {
    keyword,
    resumeId,
    userId,
  });

  try {
    const { data, error: fetchError } = await supabase
      .from('resumes')
      .select('keywords')
      .eq('id', resumeId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error(
        '[deleteResumesTableUserDeleteSingleKeyword] Fetch failed:',
        fetchError
      );
      throw fetchError;
    }

    console.log(
      '[deleteResumesTableUserDeleteSingleKeyword] Current keywords:',
      data.keywords
    );

    const updatedKeywords = data.keywords.filter((k: string) => k !== keyword);

    const { error: updateError } = await supabase
      .from('resumes')
      .update({
        keywords: updatedKeywords,
      })
      .eq('id', resumeId)
      .eq('user_id', userId);

    if (updateError) {
      console.error(
        '[deleteResumesTableUserDeleteSingleKeyword] Update failed:',
        updateError
      );
      throw updateError;
    }

    console.log(
      '[deleteResumesTableUserDeleteSingleKeyword] Keyword deleted successfully'
    );
    return true;
  } catch (error) {
    handleError(
      error,
      '[deleteResumesTableUserDeleteSingleKeyword] Failed to delete keyword'
    );
    return false;
  }
};

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
