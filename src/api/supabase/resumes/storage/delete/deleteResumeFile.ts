import { supabase } from '../../../client';
import { toast } from 'sonner';

export const deleteStorageResumeFile = async (
  userId: string,
  resumeId: string,
  file_path: string,
): Promise<boolean> => {
  console.log('[deleteStorageResumeFile] Start:', {
    userId,
    resumeId,
    file_path,
  });

    const { error: dbError } = await supabase
      .from('resumes')
      .delete()
      .eq('id', resumeId)
      .eq('user_id', userId);

    if (dbError) {
      console.error(
        '[deleteStorageResumeFile] Database delete failed:',
        dbError
      );
      throw dbError;
    }

    console.log(
      '[deleteStorageResumeFile] Resume deleted successfully'
    );
    toast.success('Resume deleted successfully');
    return true;
} 
