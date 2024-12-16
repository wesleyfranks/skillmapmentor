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
        
        // First verify the session is valid
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[useUserData] Session error:', sessionError);
          throw sessionError;
        }

        if (!session?.access_token) {
          console.error('[useUserData] No valid session found');
          throw new Error('No valid session found');
        }

        // Fetch user data with single response handling
        const { data, error } = await supabase
          .from('users')
          .select('resume_text, keywords, non_keywords')
          .eq('id', userId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            console.log('[useUserData] No user found, creating new record');
            
            // Get user email from auth
            const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
            
            if (authError || !authUser?.email) {
              console.error('[useUserData] Error getting auth user:', authError);
              toast.error("Failed to initialize user data");
              throw authError || new Error('No email found for user');
            }

            // Create new user record with required email field
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .insert({
                id: userId,
                email: authUser.email,
                keywords: [],
                non_keywords: []
              })
              .select()
              .single();

            if (createError) {
              console.error('[useUserData] Error creating user:', createError);
              toast.error("Failed to initialize user data");
              throw createError;
            }

            return {
              resume_text: null,
              keywords: [],
              non_keywords: []
            } as UserData;
          }

          console.error('[useUserData] Error fetching data:', error);
          toast.error("Failed to load user data");
          throw error;
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