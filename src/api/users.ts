import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserData {
  resume_text: string | null;
  keywords: string[];
  non_keywords: string[];
}

export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    console.log('[API] Fetching user data for:', userId);
    
    let { data, error } = await supabase
      .from('users')
      .select('resume_text, keywords, non_keywords')
      .eq('id', userId)
      .single();

    // Check for both error message formats that indicate no user found
    if (error?.message?.includes('contains 0 rows') || error?.message?.includes('The result contains 0 rows')) {
      console.log('[API] User not found in users table, creating new record');
      
      const { data: authData } = await supabase.auth.getUser(userId);
      const authUser = authData.user;
      
      if (!authUser) {
        throw new Error('Auth user not found');
      }

      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: authUser.email || '',
          full_name: authUser.user_metadata?.full_name || null,
          keywords: [],
          non_keywords: []
        });

      if (insertError) {
        console.error('[API] Error creating user:', insertError);
        throw insertError;
      }

      // Fetch the newly created user data
      const { data: newData, error: fetchError } = await supabase
        .from('users')
        .select('resume_text, keywords, non_keywords')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('[API] Error fetching new user:', fetchError);
        throw fetchError;
      }
      
      data = newData;
    } else if (error) {
      console.error('[API] Error fetching user:', error);
      throw error;
    }

    return data as UserData;
  } catch (error: any) {
    console.error('[API] Error:', error);
    toast.error("Failed to load user data");
    throw error;
  }
};

// Resume operations
export const updateUserResume = async (userId: string, resumeText: string | null) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ resume_text: resumeText })
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[API] Error updating resume:', error);
    toast.error("Failed to update resume");
    return false;
  }
};

// Keywords operations
export const updateUserKeywords = async (userId: string, keywords: string[]) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ keywords })
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[API] Error updating keywords:', error);
    toast.error("Failed to update keywords");
    return false;
  }
};

export const deleteUserKeywords = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ keywords: [] })
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[API] Error clearing keywords:', error);
    toast.error("Failed to clear keywords");
    return false;
  }
};

export const updateUserNonKeywords = async (userId: string, nonKeywords: string[]) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ non_keywords: nonKeywords })
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[API] Error updating non-keywords:', error);
    toast.error("Failed to update non-keywords");
    return false;
  }
};