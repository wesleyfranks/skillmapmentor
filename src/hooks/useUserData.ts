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
        console.log('[useUserData] Fetching data for user:', userId);
        
        const { data, error } = await supabase
          .from('users')
          .select('resume_text, keywords, non_keywords')
          .eq('id', userId)
          .single();

        // Log the response for debugging
        console.log('[useUserData] Response:', { data, error });

        if (error) {
          console.error('[useUserData] Error fetching data:', error);
          toast.error("Failed to load user data");
          throw error;
        }

        if (!data) {
          console.log('[useUserData] No user data found, returning default state');
          return {
            resume_text: null,
            keywords: [],
            non_keywords: []
          } as UserData;
        }

        // Log successful data retrieval
        console.log('[useUserData] User data found:', {
          hasResumeText: !!data.resume_text,
          keywordsCount: data.keywords?.length
        });
        
        // Return the user data with fallbacks for null values
        return {
          resume_text: data.resume_text || null,
          keywords: data.keywords || [],
          non_keywords: data.non_keywords || []
        } as UserData;

      } catch (error) {
        console.error('[useUserData] Error in try/catch:', error);
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