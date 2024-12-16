import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useUserData = (
  userId: string, 
  onResumeLoad: (text: string) => void, 
  onKeywordsLoad?: (keywords: string[], nonKeywords: string[]) => void
) => {
  return useQuery({
    queryKey: ['userData', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('[useUserData][queryFn] No userId provided');
        return null;
      }

      try {
        console.log('[useUserData][queryFn] Fetching user data:', {
          userId,
          timestamp: new Date().toISOString()
        });

        const { data, error } = await supabase
          .from('users')
          .select('resume_text, keywords, non_keywords')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('[useUserData][queryFn] Error fetching user data:', error);
          throw error;
        }

        console.log('[useUserData][queryFn] Query response:', {
          hasData: !!data,
          hasResumeText: !!data?.resume_text,
          keywordsCount: data?.keywords?.length || 0,
          nonKeywordsCount: data?.non_keywords?.length || 0
        });

        // Only call callbacks if we have data
        if (data) {
          if (data.resume_text) {
            console.log('[useUserData][queryFn] Calling onResumeLoad with text length:', 
              data.resume_text.length);
            onResumeLoad(data.resume_text);
          }

          if (onKeywordsLoad) {
            console.log('[useUserData][queryFn] Calling onKeywordsLoad with:', {
              keywordsCount: data.keywords?.length || 0,
              nonKeywordsCount: data.non_keywords?.length || 0
            });
            onKeywordsLoad(
              data.keywords || [], 
              data.non_keywords || []
            );
          }
        }

        return data;
      } catch (error: any) {
        console.error('[useUserData][queryFn] Error in fetchUserData:', error);
        toast.error("Could not load your data. Please try refreshing the page.");
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // Data becomes stale after 5 minutes
    gcTime: 1000 * 60 * 30, // Cache for 30 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });
};