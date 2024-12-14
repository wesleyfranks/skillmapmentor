import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useResumeActions = (userId: string) => {
  const { toast } = useToast();

  const saveResume = async (resumeText: string) => {
    try {
      const { data: userData, error: fetchError } = await supabase
        .from("users")
        .select("keywords")
        .eq("id", userId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from("users")
        .update({ resume_text: resumeText })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your resume has been saved.",
      });

      return !userData?.keywords?.length;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving resume",
        description: error.message,
      });
      return false;
    }
  };

  const deleteResume = async () => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ 
          resume_text: null, 
          resume_file_path: null
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your resume has been deleted.",
      });
      
      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting resume",
        description: error.message,
      });
      return false;
    }
  };

  return {
    saveResume,
    deleteResume
  };
};