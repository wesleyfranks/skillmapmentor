import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export interface UserData {
  resume_text: string | null;
  keywords: string[];
  non_keywords: string[];
}

export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    console.log('[API] Fetching user data for:', userId);
    
    // First check if we have a valid session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('[API] Session error:', sessionError);
      toast.error("Please log in to continue");
      throw sessionError;
    }

    if (!sessionData.session) {
      console.log('[API] No active session');
      toast.error("Please log in to continue");
      return null;
    }

    // Get the user data with proper select parameter
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('resume_text, keywords, non_keywords')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('[API] Error fetching user:', fetchError);
      if (fetchError.code === '42501') {
        toast.error("You don't have permission to access this data");
      } else {
        toast.error("Failed to load user data");
      }
      throw fetchError;
    }

    // If no user found, create one
    if (!userData) {
      console.log('[API] User not found in users table, creating new record');
      
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('[API] Error getting auth user:', authError);
        toast.error("Authentication error");
        throw authError;
      }

      const authUser = authData.user;
      if (!authUser) {
        toast.error("No authenticated user found");
        throw new Error('Auth user not found');
      }

      const newUser = {
        id: userId,
        email: authUser.email || '',
        full_name: authUser.user_metadata?.full_name || null,
        keywords: [],
        non_keywords: []
      };

      const { error: insertError } = await supabase
        .from('users')
        .insert([newUser]);

      if (insertError) {
        console.error('[API] Error creating user:', insertError);
        if (insertError.code === '42501') {
          toast.error("You don't have permission to create user data");
        } else {
          toast.error("Failed to create user data");
        }
        throw insertError;
      }

      // Return default data for new user
      return {
        resume_text: null,
        keywords: [],
        non_keywords: []
      };
    }

    return userData as UserData;
  } catch (error: any) {
    console.error('[API] Error:', error);
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
      .from('users')
      .update({ keywords })
      .eq('id', userId);

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
      .from('users')
      .update({ keywords: [] })
      .eq('id', userId);

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
      .from('users')
      .update({ non_keywords: nonKeywords })
      .eq('id', userId);

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