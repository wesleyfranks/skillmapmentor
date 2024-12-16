import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

      console.log('[useUserData] Fetching data for user:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('resume_text, keywords, non_keywords')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[useUserData] Error fetching data:', error);
        throw error;
      }

      console.log('[useUserData] Data fetched successfully:', {
        hasResumeText: !!data?.resume_text,
        keywordsCount: data?.keywords?.length
      });

      return {
        resume_text: data?.resume_text || null,
        keywords: data?.keywords || [],
        non_keywords: data?.non_keywords || []
      } as UserData;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30    // 30 minutes
  });
};