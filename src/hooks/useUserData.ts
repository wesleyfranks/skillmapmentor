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
          // If the error is that no rows were found, create a new user record
          if (error.code === 'PGRST116') {
            console.log('[useUserData] No user record found, creating one');
            const { data: newUser, error: insertError } = await supabase
              .from('users')
              .insert([{ 
                id: userId,
                keywords: [],
                non_keywords: []
              }])
              .select()
              .single();

            if (insertError) {
              console.error('[useUserData] Error creating user record:', insertError);
              toast.error("Failed to initialize user data");
              throw insertError;
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

        // Return the user data with fallbacks for null values
        return {
          resume_text: data?.resume_text || null,
          keywords: data?.keywords || [],
          non_keywords: data?.non_keywords || []
        } as UserData;

      } catch (error: any) {
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