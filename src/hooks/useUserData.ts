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

        if (error) {
          console.error('[useUserData] Query error:', error.message);
          throw error;
        }

        console.log('[useUserData] Data fetched successfully:', {
          hasResumeText: !!data?.resume_text,
          keywordsCount: data?.keywords?.length || 0,
          nonKeywordsCount: data?.non_keywords?.length || 0
        });

        return data as UserData;

      } catch (error: any) {
        console.error('[useUserData] Error:', error.message);
        toast.error("Failed to load user data");
        throw error;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    gcTime: 1000 * 60 * 30,   // Keep unused data for 30 minutes
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnMount: false
  });
};