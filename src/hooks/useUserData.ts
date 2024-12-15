import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useUserData = (userId: string, onResumeLoad: (text: string) => void, onKeywordsLoad?: (keywords: string[]) => void) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  useEffect(() => {
    const fetchUserData = async (attempt = 0) => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      try {
        console.log('Fetching user data for ID:', userId);
        
        // First check if we're authenticated
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError) {
          console.error('Authentication error:', authError);
          throw new Error('Authentication error: ' + authError.message);
        }

        if (!session) {
          console.error('No active session');
          throw new Error('No active session');
        }

        const { data, error } = await supabase
          .from("users")
          .select("resume_text, keywords")
          .eq("id", userId)
          .single();

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Received data:', data);

        if (data?.resume_text) {
          onResumeLoad(data.resume_text);
        }
        
        if (data?.keywords && onKeywordsLoad) {
          console.log('Setting initial keywords:', data.keywords);
          onKeywordsLoad(data.keywords);
        }
        
        setRetryCount(0); // Reset on success
      } catch (error: any) {
        console.error('Error fetching user data:', {
          error,
          userId,
          attempt,
          retryCount: attempt
        });
        
        if (attempt < MAX_RETRIES) {
          setRetryCount(attempt + 1);
          toast({
            title: "Connection issue",
            description: `Retrying... (${attempt + 1}/${MAX_RETRIES})`,
            duration: RETRY_DELAY
          });
          
          setTimeout(() => {
            fetchUserData(attempt + 1);
          }, RETRY_DELAY * Math.pow(2, attempt)); // Exponential backoff
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load your data. Please try logging in again."
          });
        }
      } finally {
        if (attempt === 0) { // Only set loading to false after initial attempt
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [userId, toast, onResumeLoad, onKeywordsLoad]);

  return { isLoading };
};