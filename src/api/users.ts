import { supabase } from "../integrations/supabase/client"; // Corrected import path
import { toast } from "sonner";

export interface UserData {
  resume_text: string | null;
  file_path: string | null;
  keywords: string[];
  non_keywords: string[];
}

export const getUserData = async (userId: string): Promise<UserData[]> => {
  try {
    console.log('[API] Fetching resumes for user:', userId);

    const { data: resumes, error } = await supabase
      .from('resumes')
      .select(
        'id, user_id, file_path, resume_text, keywords, non_keywords, created_at, updated_at'
      )
      .eq('user_id', userId) // Filtering by user_id
      .order('updated_at', { ascending: false })
      .limit(5);

    if (error) {
      toast.error('Failed to fetch resumes.');
      throw error;
    }

    return resumes || [];
  } catch (err) {
    console.error('[API] Error fetching resumes:', err);
    return [];
  }
};

export const updateUserResume = async (userId: string, resumeText: string | null) => {
  try {
    const { error } = await supabase
      .from('resumes')
      .update({ file_path: resumeText, resume_text: null }) // Added resume_text
      .eq('user_id', userId);

    if (error) {
      if (error.code === '42501') {
        toast.error("You don't have permission to update resume");
      } else {
        toast.error("Failed to update resume");
      }
      throw error;
    }
    return true;
  } catch (error) {
    console.error('[API] Error updating resume:', error);
    return false;
  }
};

// Keywords operations
export const updateUserKeywords = async (userId: string, keywords: string[]) => {
  try {
    const { error } = await supabase
      .from('resumes')
      .update({ keywords, resume_text: null }) // Added resume_text
      .eq('user_id', userId);

    if (error) {
      if (error.code === '42501') {
        toast.error("You don't have permission to update keywords");
      } else {
        toast.error("Failed to update keywords");
      }
      throw error;
    }
    return true;
  } catch (error) {
    console.error('[API] Error updating keywords:', error);
    return false;
  }
};

export const deleteUserKeywords = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('resumes')
      .update({ keywords: [], resume_text: null }) // Added resume_text
      .eq('user_id', userId);

    if (error) {
      if (error.code === '42501') {
        toast.error("You don't have permission to clear keywords");
      } else {
        toast.error("Failed to clear keywords");
      }
      throw error;
    }
    return true;
  } catch (error) {
    console.error('[API] Error clearing keywords:', error);
    return false;
  }
};

export const updateUserNonKeywords = async (userId: string, nonKeywords: string[]) => {
  try {
    const { error } = await supabase
      .from('resumes')
      .update({ non_keywords: nonKeywords }) // Added resume_text
      .eq('user_id', userId);

    if (error) {
      if (error.code === '42501') {
        toast.error("You don't have permission to update non-keywords");
      } else {
        toast.error("Failed to update non-keywords");
      }
      throw error;
    }
    return true;
  } catch (error) {
    console.error('[API] Error updating non-keywords:', error);
    return false;
  }
};
