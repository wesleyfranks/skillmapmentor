import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useUserData = (
  userId: string, 
  onResumeLoad: (text: string) => void, 
  onKeywordsLoad?: (keywords: string[], nonKeywords: string[]) => void
) => {
  const { isLoading } = useQuery({
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

        // First verify we have a valid session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('No valid session found');
        }

        // Fetch the user data
        const { data, error } = await supabase
          .from('users')
          .select('resume_text, keywords, non_keywords')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching user data:', error);
          throw error;
        }

        // If we have data, call the callbacks
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
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
  });

  return { isLoading };
};