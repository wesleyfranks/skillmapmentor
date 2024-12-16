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
        
        // First, verify the session is valid
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[useUserData] Session error:', sessionError.message);
          throw new Error('Authentication error');
        }

        if (!session) {
          console.error('[useUserData] No active session found');
          throw new Error('No active session');
        }

        // Log authentication status (without sensitive data)
        console.log('[useUserData] User authenticated:', !!session);

        // Make a single query to fetch user data using the Supabase client
        const { data, error: queryError } = await supabase
          .from('users')
          .select('resume_text, keywords, non_keywords')
          .eq('id', userId)
          .single();

        // Handle query errors
        if (queryError) {
          console.error('[useUserData] Query error:', {
            code: queryError.code,
            message: queryError.message,
            details: queryError.details
          });
          throw queryError;
        }

        if (!data) {
          console.error('[useUserData] No data found for user:', userId);
          throw new Error('No data found');
        }

        // Log success (without sensitive data)
        console.log('[useUserData] Data fetched successfully:', {
          hasResumeText: !!data.resume_text,
          keywordsCount: data.keywords?.length || 0,
          nonKeywordsCount: data.non_keywords?.length || 0
        });

        return data as UserData;

      } catch (error: any) {
        // Log error details (without sensitive data)
        console.error('[useUserData] Error:', {
          code: error.code,
          message: error.message,
          hint: error?.hint
        });
        
        toast.error("Failed to load user data");
        throw error;
      }
    },
    retry: (failureCount, error: any) => {
      // Only retry on network errors, not on auth or data errors
      return failureCount < 2 && !error.message.includes('No active session');
    },
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    gcTime: 1000 * 60 * 30,   // Keep unused data for 30 minutes
    refetchOnWindowFocus: false,
    refetchInterval: false // Disable automatic refetching
  });
};