import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type UserData = {
  resume_text: string | null;
  keywords: string[];
  non_keywords: string[];
};

export const useUserData = (userId: string) => {
  return useQuery({
    queryKey: ['userData', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('[useUserData] No userId provided');
        return null;
      }

      try {
        console.log('[useUserData] Attempting to fetch data for user:', userId);
        
        // Get the current session to verify authentication
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.error('[useUserData] No active session found');
          throw new Error('No active session');
        }

        console.log('[useUserData] Session found, access token present:', !!session.access_token);
        
        const { data, error } = await supabase
          .from('users')
          .select('resume_text, keywords, non_keywords')
          .eq('id', userId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            console.error('[useUserData] No matching row found for user:', userId);
            console.error('[useUserData] This might be due to:');
            console.error('- User not properly authenticated');
            console.error('- Row Level Security blocking access');
            console.error('- No record exists for this user ID');
          } else {
            console.error('[useUserData] Database error:', error);
          }
          throw error;
        }

        console.log('[useUserData] Successfully fetched data:', {
          hasResumeText: !!data?.resume_text,
          keywordsCount: data?.keywords?.length || 0,
          nonKeywordsCount: data?.non_keywords?.length || 0
        });

        return data as UserData;

      } catch (error: any) {
        console.error('[useUserData] Error in try/catch:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast.error("Failed to load user data");
        throw error;
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30,   // 30 minutes
    refetchOnWindowFocus: false
  });
};