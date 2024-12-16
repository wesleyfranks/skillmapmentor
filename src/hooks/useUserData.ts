import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useUserData = (
  userId: string, 
  onResumeLoad: (text: string) => void, 
  onKeywordsLoad?: (keywords: string[], nonKeywords: string[]) => void
) => {
  const { isLoading, refetch } = useQuery({
    queryKey: ['userData', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('No userId provided');
        return null;
      }

      try {
        console.log('Fetching user data:', {
          userId,
          timestamp: new Date().toISOString()
        });

        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          throw new Error('No valid session found');
        }

        const { data, error } = await supabase
          .from('users')
          .select('resume_text, keywords, non_keywords')
          .eq('id', userId)
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user data:', error);
          throw error;
        }

        if (data) {
          console.log('Successfully received user data:', {
            hasResumeText: !!data.resume_text,
            keywordsCount: data.keywords?.length,
            nonKeywordsCount: data.non_keywords?.length
          });

          if (data.resume_text) {
            onResumeLoad(data.resume_text);
          }

          if (onKeywordsLoad) {
            onKeywordsLoad(data.keywords || [], data.non_keywords || []);
          }
        }

        return data;
      } catch (error: any) {
        console.error('Error in fetchUserData:', error);
        toast.error("Could not load your data. Please try refreshing the page.");
        throw error;
      }
    },
    staleTime: Infinity, // Data won't become stale automatically
    gcTime: 1000 * 60 * 30, // Cache for 30 minutes
  });

  return { isLoading, refetch };
};