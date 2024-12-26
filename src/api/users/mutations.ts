import { supabase } from "../../integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "../../integrations/supabase/types"; // Import the Database type

export type UserUpdateData = Partial<Database['public']['Tables']['users']['Row']>; // Define the UserUpdateData type

export const updateUserData = async (userId: string, data: UserUpdateData): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .update(data)
      .eq('user_id', userId);
      console.log("UserId: " + userId)

    if (error) {
      if (error.code === '42501') {
        toast.error("You don't have permission to update this data");
      } else {
        toast.error("Failed to update user data");
      }
      throw error;
    }
    return true;
  } catch (error) {
    handleError(error, "Error updating user data");
    return false;
  }
};

const handleError = (error: any, customMessage: string) => {
  console.error(`[API] ${customMessage}:`, error);
  if (error.code === '42501') {
    toast.error("You don't have permission to perform this action");
  } else {
    toast.error(customMessage);
  }
};

export const uploadResume = async (userId: string, file: File) => {
  try {
    // Validate file
    if (file.size > 25 * 1024 * 1024) {
      toast.error("File size exceeds the 25MB limit");
      return false;
    }
    if (!['application/pdf', 'application/msword'].includes(file.type)) {
      toast.error("Only PDF and Word documents are supported");
      return false;
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const filePath = `${userId}/${fileName}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Create new resume record
    const { error: dbError } = await supabase
      .from('resumes')
      .insert({
        user_id: userId,
        file_path: filePath,
        created_at: new Date().toISOString(),
        keywords: [], // will update updated after PDF processing function
        non_keywords: [], // this is not used in first upload
        resume_text: '' // Will be updated by PDF processing function
      });

    if (dbError) throw dbError;

    // Trigger resume text extraction (assuming you have a separate process)
    // Placeholder for the processResumeText function
    const processResumeText = async (userId: string, filePath: string) => {
      // Implement the function or import it if defined elsewhere
      console.log(`Processing resume text for user ${userId} and file ${filePath}`);
    };

    await processResumeText(userId, filePath);

    toast.success('Resume uploaded successfully');
    return true;

  } catch (error) {
    handleError(error, "Error uploading resume");
    return false;
  }
};

// Helper function to get all user's resumes
export const getUserResumes = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, "Error fetching resumes");
    return [];
  }
};

// Helper function to delete a resume
export const deleteResume = async (userId: string, resumeId: string) => {
  try {
    // Get file path
    const { data: resume } = await supabase
      .from('resumes')
      .select('file_path')
      .eq('id', resumeId)
      .single();

    if (resume?.file_path) {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('resumes')
        .remove([resume.file_path]);

      if (storageError) throw storageError;
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('resumes')
      .delete()
      .eq('id', resumeId)
      .eq('user_id', userId); // Safety check

    if (dbError) throw dbError;

    toast.success('Resume deleted successfully');
    return true;
  } catch (error) {
    handleError(error, "Error deleting resume");
    return false;
  }
};

export const insertResume = async (userId: string, filePath: string, keywords: string[] = []) => {
  try {
    const { error } = await supabase
      .from('resumes')
      .insert({
        user_id: userId,
        file_path: filePath,
        keywords,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      handleError(error, "Failed to insert resume");
      return false;
    }

    toast.success("Resume inserted successfully");
    return true;
  } catch (error) {
    handleError(error, "Error inserting resume");
    return false;
  }
};

export const getResumesByUser = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      handleError(error, "Failed to retrieve resumes");
      return null;
    }

    return data;
  } catch (error) {
    handleError(error, "Error retrieving resumes");
    return null;
  }
};

export const updateUserKeywords = async (userId: string, keywords: string[]) => {
  try {
    const { error } = await supabase
      .from('resumes')
      .update({ keywords })
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    handleError(error, "Error updating user keywords");
    return false;
  }
};

export const deleteUserKeywords = async (userId: string) => {
  try {
    await updateUserKeywords(userId, []);
    return true;
  } catch (error) {
    handleError(error, "Error deleting user keywords");
    return false;
  }
};

export const updateUserNonKeywords = async (userId: string, nonKeywords: string[]) => {
  try {
    const { error } = await supabase
      .from('resumes')
      .update({ non_keywords: nonKeywords })
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    handleError(error, "Error updating user non-keywords");
    return false;
  }
};

export const addToNonKeywords = async (
  userId: string,
  keyword: string,
  currentKeywords: string[],
  currentNonKeywords: string[]
): Promise<boolean> => {
  try {
    console.log('[API] Adding to non-keywords:', { keyword, userId });

    const newKeywords = currentKeywords.filter(
      (k) => k.toLowerCase() !== keyword.toLowerCase()
    );
    const newNonKeywords = [...currentNonKeywords, keyword];

    const { error } = await supabase
      .from('resumes')
      .update({
        keywords: newKeywords,
        non_keywords: newNonKeywords,
      })
      .eq('user_id', userId);

    if (error) throw error;

    console.log('[API] Successfully added to non-keywords:', {
      keyword,
      userId,
    });
    return true;
  } catch (error) {
    console.error('[API] Error adding to non-keywords:', error);
    return false;
  }
};
