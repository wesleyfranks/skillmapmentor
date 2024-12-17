import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserUpdateData } from "./types";

export const updateUserData = async (userId: string, data: UserUpdateData): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .update(data)
      .eq('id', userId);

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
    console.error('[API] Error updating user data:', error);
    return false;
  }
};

export const updateUserResume = async (userId: string, resumeText: string | null) => {
  return updateUserData(userId, { resume_text: resumeText });
};

export const updateUserKeywords = async (userId: string, keywords: string[]) => {
  return updateUserData(userId, { keywords });
};

export const deleteUserKeywords = async (userId: string) => {
  return updateUserData(userId, { keywords: [] });
};

export const updateUserNonKeywords = async (userId: string, nonKeywords: string[]) => {
  return updateUserData(userId, { non_keywords: nonKeywords });
};

export const addToNonKeywords = async (userId: string, keyword: string, currentKeywords: string[], currentNonKeywords: string[]) => {
  try {
    console.log('[API] Adding to non-keywords:', { keyword, userId });
    
    // Remove the keyword from keywords list and add to non-keywords
    const newKeywords = currentKeywords.filter(k => k.toLowerCase() !== keyword.toLowerCase());
    const newNonKeywords = [...currentNonKeywords, keyword];

    const { error } = await supabase
      .from('users')
      .update({
        keywords: newKeywords,
        non_keywords: newNonKeywords
      })
      .eq('id', userId);

    if (error) {
      console.error('[API] Error updating non-keywords:', error);
      if (error.code === '42501') {
        toast.error("You don't have permission to update non-keywords");
      } else {
        toast.error("Failed to update non-keywords");
      }
      return false;
    }

    toast.success(`Added "${keyword}" to non-keywords list`);
    return true;
  } catch (error) {
    console.error('[API] Error adding to non-keywords:', error);
    toast.error("Failed to update non-keywords");
    return false;
  }
};