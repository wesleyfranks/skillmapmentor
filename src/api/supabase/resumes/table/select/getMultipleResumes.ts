import { supabase } from '../../../client';
import { handleError } from '../../../../../helpers/handleError';

export const getResumesTableUserMultipleResumes = async (userId: string) => {
  console.log('[getResumesTableUserMultipleResumes] Start:', { userId });

  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(
        '[getResumesTableUserMultipleResumes] Fetch failed:',
        error
      );
      throw error;
    }

    console.log(
      '[getResumesTableUserMultipleResumes] Fetch successful:',
      data,
      'resumes'
    );
    return data;
  } catch (error) {
    handleError(
      error,
      '[getResumesTableUserMultipleResumes] Failed to fetch resumes'
    );
    return [];
  }
};