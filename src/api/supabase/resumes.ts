import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';
import { handleError } from '../../helpers/handleError';

export const uploadResume = async (
  userId: string,
  file: File
): Promise<boolean> => {
  try {
    if (
      file.size > 25 * 1024 * 1024 ||
      !['application/pdf', 'application/msword'].includes(file.type)
    ) {
      toast.error(
        'Invalid file. Only PDFs and Word documents under 25MB are allowed.'
      );
      return false;
    }

    const timestamp = Date.now();
    const filePath = `${userId}/${timestamp}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { error: dbError } = await supabase.from('resumes').insert({
      user_id: userId,
      file_path: filePath,
      created_at: new Date().toISOString(),
    });

    if (dbError) throw dbError;

    toast.success('Resume uploaded successfully');
    return true;
  } catch (error) {
    handleError(error, 'Failed to upload resume');
    return false;
  }
};

export const insertResume = async (
  userId: string,
  filePath: string,
  keywords: string[] = []
) => {
  try {
    const { error } = await supabase.from('resumes').insert({
      user_id: userId,
      file_path: filePath,
      keywords,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      handleError(error, 'Failed to insert resume');
      return false;
    }

    toast.success('Resume inserted successfully');
    return true;
  } catch (error) {
    handleError(error, 'Error inserting resume');
    return false;
  }
};

// Create an updateResume function
// This function should update the keywords and updated_at fields of a resume
// It should accept the resume ID, keywords, and user ID as arguments
// It should return a boolean indicating whether the update was successful
// Use the supabase update method to update the keywords and updated_at fields
// Handle any errors that occur and return false
// If the update is successful, return true
export const updateUserResume = async (
  userId: string,
  resumeId: string,
  resumeText?: string,
  keywords?: string[]
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('resumes')
      .update({ resumeText, keywords, updated_at: new Date().toISOString() })
      .eq('id', resumeId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    handleError(error, 'Failed to update resume');
    return false;
  }
};

export const getUserResumes = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'Failed to fetch resumes');
    return [];
  }
};

export const deleteResume = async (
  userId: string,
  resumeId: string
): Promise<boolean> => {
  try {
    const { data, error: fetchError } = await supabase
      .from('resumes')
      .select('file_path')
      .eq('id', resumeId)
      .single();

    if (fetchError) throw fetchError;

    if (data?.file_path) {
      const { error: storageError } = await supabase.storage
        .from('resumes')
        .remove([data.file_path]);
      if (storageError) throw storageError;
    }

    const { error: dbError } = await supabase
      .from('resumes')
      .delete()
      .eq('id', resumeId)
      .eq('user_id', userId);
    if (dbError) throw dbError;

    toast.success('Resume deleted successfully');
    return true;
  } catch (error) {
    handleError(error, 'Failed to delete resume');
    return false;
  }
};

// Create a deleteKeyword function
// This function should delete a keyword from the keywords array of a resume
// It should accept the keyword, resume ID, and user ID as arguments
// It should return a boolean indicating whether the deletion was successful
// Use the supabase update method to remove the keyword from the keywords array
// Handle any errors that occur and return false
// If the deletion is successful, return true
// Hint: You can use the arrayRemove function to remove an item from an array
export const deleteUserKeyword = async (
  keyword: string,
  resumeId: string,
  userId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('resumes')
      .update({
        keywords: (await supabase
          .from('resumes')
          .select('keywords')
          .eq('id', resumeId)
          .eq('user_id', userId)
          .single()).data.keywords.filter((k: string) => k !== keyword),
      })
      .eq('id', resumeId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    handleError(error, 'Failed to delete keyword');
    return false;
  }
};

// Create a deleteKeywords function
// This function should delete all keywords from the keywords array of a resume
// It should accept the resume ID and user ID as arguments
// It should return a boolean indicating whether the deletion was successful
// Use the supabase update method to set the keywords array to an empty array
// Handle any errors that occur and return false
// If the deletion is successful, return true
// Hint: You can use the arrayRemove function to remove all items from an array
export const deleteUserKeywords = async (
  resumeId: string,
  userId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('resumes')
      .update({
        keywords: [],
      })
      .eq('id', resumeId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    handleError(error, 'Failed to delete keywords');
    return false;
  }
};