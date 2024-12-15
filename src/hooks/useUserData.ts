import { useState, useEffect } from "react";
import { toast } from "sonner";
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
        
        // Check if we're authenticated
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) {
          console.error('Authentication error:', authError);
          toast.error("Authentication error. Please try logging in again.");
          return;
        }
        
        // Retry logic for network errors
        if (attempt < MAX_RETRIES && (
          error.message === "Failed to fetch" || 
          error.code === "NETWORK_ERROR" ||
          error.message?.includes('FetchError')
        )) {
          setRetryCount(attempt + 1);
          toast.info(
            `Network error, retrying... (${attempt + 1}/${MAX_RETRIES})`, 
            { duration: RETRY_DELAY }
          );
          
          setTimeout(() => {
            fetchUserData(attempt + 1);
          }, RETRY_DELAY * Math.pow(2, attempt)); // Exponential backoff
        } else {
          toast.error("Error fetching user data. Please refresh the page.");
        }
      } finally {
        if (attempt === 0) { // Only set loading to false after initial attempt
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [userId, onResumeLoad, onKeywordsLoad]);

  return { isLoading };
};