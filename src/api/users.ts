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

    console.log('[API] Session found:', {
      userId: sessionData.session.user.id,
      requestedUserId: userId,
      accessToken: sessionData.session.access_token.slice(0, 10) + '...'
    });

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

    console.log('[API] User data response:', userData);

    // If no user data found, return default empty state
    if (!userData) {
      console.log('[API] No user data found for authenticated user');
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
