import { supabase } from '../../../client';
import { handleError } from '../../../../../helpers/handleError';

/**
 * Fetches a single resume by its ID for a specific user.
 * @param userId - The ID of the user performing the query.
 * @param resumeId - The ID of the resume to fetch.
 * @returns A Promise<object | null> containing the resume data, or null if an error occurs or no resume is found.
 */
export const getSingleResume = async (
  userId: string,
  resumeId: string
): Promise<object | null> => {
  console.log('[getSingleResume] Start:', { userId, resumeId });

  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('[getSingleResume] Fetch failed:', error);
      throw error;
    }

    console.log('[getSingleResume] Fetch successful:', data);
    return data;
  } catch (error) {
    handleError(error, '[getSingleResume] Failed to fetch resume');
    return null;
  }
};
