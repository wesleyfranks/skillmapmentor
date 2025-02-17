import { supabase } from '../../../client';
import { handleError } from '../../../../../helpers/handleError';

export const insertResumesTableResume = async (
  userId: string,
  filePath: string,
  resumeText?: string,
  keywords?: string[],
  nonKeywords?: string[]
): Promise<string | null> => {
  console.log('[resumesTableUploadSingleResume] Start:', { userId, filePath });

  try {
    // Use maybeSingle() to avoid a 406 error when no row is found
    const { data: existingResume, error: fetchError } = await supabase
      .from('resumes')
      .select('id, file_path, resume_text')
      .match({ user_id: userId, file_path: filePath })
      .maybeSingle();

    if (fetchError) {
      console.error(
        '[resumesTableUploadSingleResume] Error fetching existing resume:',
        fetchError
      );
      throw fetchError;
    }

    if (existingResume) {
      console.log(
        '[resumesTableUploadSingleResume] Found existing resume, updating:',
        existingResume.id
      );

      // Update existing resume
      const { error: updateError } = await supabase
        .from('resumes')
        .update({
          resume_text: resumeText || existingResume.resume_text || null,
          keywords: keywords || [],
          non_keywords: nonKeywords || [],
          updated_at: new Date().toISOString(),
        })
        .match({ id: existingResume.id, user_id: userId });

      if (updateError) {
        console.error(
          '[resumesTableUploadSingleResume] Failed to update resume:',
          updateError
        );
        throw updateError;
      }

      console.log('[resumesTableUploadSingleResume] Update successful:', {
        resumeId: existingResume.id,
      });
      return existingResume.id;
    }

    console.log(
      '[resumesTableUploadSingleResume] No existing resume, inserting new one.'
    );

    // Insert new resume
    const { data, error } = await supabase
      .from('resumes')
      .insert({
        user_id: userId,
        file_path: filePath,
        resume_text: resumeText || null,
        keywords: keywords || [],
        non_keywords: nonKeywords || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .maybeSingle();

    if (error) {
      console.error('[resumesTableUploadSingleResume] Insert failed:', error);
      throw error;
    }

    console.log('[resumesTableUploadSingleResume] Insert successful:', {
      resumeId: data?.id,
    });
    return data?.id || null;
  } catch (error) {
    handleError(
      error,
      '[resumesTableUploadSingleResume] Error handling resume'
    );
    return null;
  }
};
