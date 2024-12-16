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
        
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('resume_text, keywords, non_keywords')
          .eq('id', userId)
          .single();

        if (fetchError) {
          console.error('[useUserData] Error fetching data:', fetchError);
          toast.error("Failed to load user data");
          throw fetchError;
        }

        if (!existingUser) {
          console.error('[useUserData] No user data found');
          return {
            resume_text: null,
            keywords: [],
            non_keywords: []
          } as UserData;
        }

        console.log('[useUserData] User data found:', {
          hasResumeText: !!existingUser.resume_text,
          keywordsCount: existingUser.keywords?.length
        });
        
        return {
          resume_text: existingUser.resume_text || null,
          keywords: existingUser.keywords || [],
          non_keywords: existingUser.non_keywords || []
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