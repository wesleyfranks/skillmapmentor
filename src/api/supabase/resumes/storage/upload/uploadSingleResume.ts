import { handleError } from "@/helpers/handleError";
import { supabase } from "../../../client";
import { toast } from "sonner";

export const uploadStorageResumeFile = async (
  userId: string,
  file: File
): Promise<string | null> => {
  try {
    console.log('[uploadStorageResumeFile] Start:', {
      userId,
      fileName: file.name,
    });

    if (
      file.size > 25 * 1024 * 1024 ||
      ![
        'application/pdf',
        'application/txt',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/x-iwork-pages-sffpages',
      ].includes(file.type)
    ) {
      toast.error(
        'Invalid file. Only PDF, Word (.doc, .docx), Text (.txt), and Pages files under 25MB are allowed.'
      );
      console.log('[uploadStorageResumeFile] File validation failed');
      return null;
    }

    const timestamp = Date.now();
    const filePath = `${userId}/${timestamp}_${file.name}`;
    console.log('[uploadStorageResumeFile] Generated filePath:', filePath);

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file);

    if (uploadError) {
      console.error(
        '[uploadStorageResumeFile] Storage upload failed:',
        uploadError
      );
      throw uploadError;
    }

    console.log(
      '[uploadStorageResumeFile] File uploaded successfully:',
      filePath
    );

    return filePath; // Return filePath instead of inserting into the database
  } catch (error) {
    handleError(error, '[uploadStorageResumeFile] Failed to upload resume');
    return null;
  }
};