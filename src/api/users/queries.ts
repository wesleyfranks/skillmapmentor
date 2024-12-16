import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserData } from "./types";

export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    console.log('[API] Fetching user data for:', userId);
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('[API] Session error:', sessionError);
      toast.error("Please log in to continue");
      throw sessionError;
    }

    if (!session) {
      console.log('[API] No active session');
      toast.error("Please log in to continue");
      return null;
    }

    console.log('[API] Session found:', {
      userId: session.user.id,
      requestedUserId: userId,
      accessToken: session.access_token.slice(0, 10) + '...'
    });

    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('resume_text, keywords, non_keywords')
      .eq('id', userId)
      .single();

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

    if (!userData) {
      console.log('[API] No user data found for authenticated user');
      return {
        resume_text: null,
        keywords: [],
        non_keywords: []
      };
    }

    return userData;
  } catch (error: any) {
    console.error('[API] Error:', error);
    throw error;
  }
};