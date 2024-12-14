import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useUserData = (userId: string, onResumeLoad: (text: string) => void) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResumeText = async () => {
      if (!userId) return;
      
      try {
        const { data, error } = await supabase
          .from("users")
          .select("resume_text")
          .eq("id", userId)
          .single();

        if (error) throw error;

        if (data?.resume_text) {
          onResumeLoad(data.resume_text);
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error fetching resume",
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumeText();
  }, [userId, toast, onResumeLoad]);

  return { isLoading };
};