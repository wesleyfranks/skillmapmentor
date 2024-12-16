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
          .select('resume_text, keywords, non_keywords, email')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.error('[useUserData] Error fetching data:', error);
          toast.error("Failed to load user data");
          throw error;
        }

        // If no data is found, create a new user record
        if (!data) {
          console.log('[useUserData] No user found, creating new record');
          
          // First, get the user's email from auth
          const { data: authUser, error: authError } = await supabase.auth.getUser(userId);
          
          if (authError || !authUser.user?.email) {
            console.error('[useUserData] Error getting auth user:', authError);
            toast.error("Failed to initialize user data");
            throw authError;
          }

          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: userId,
              email: authUser.user.email,
              resume_text: null,
              keywords: [],
              non_keywords: []
            });

          if (insertError) {
            console.error('[useUserData] Error creating user:', insertError);
            toast.error("Failed to initialize user data");
            throw insertError;
          }

          return {
            resume_text: null,
            keywords: [],
            non_keywords: []
          } as UserData;
        }

        console.log('[useUserData] Data fetched successfully:', {
          hasResumeText: !!data.resume_text,
          keywordsCount: data.keywords?.length
        });

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