import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useResumeActions = (userId: string) => {
  const saveResume = async (resumeText: string) => {
    try {
      const { data: existingUser } = await supabase
        .from("users")
        .select("resume_text, keywords")
        .eq("id", userId)
        .single();

      const { error } = await supabase
        .from("users")
        .update({ resume_text: resumeText })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Resume saved successfully");
      
      // Return true if we need to analyze (no existing keywords)
      return !existingUser?.keywords?.length;
    } catch (error) {
      console.error("Error saving resume:", error);
      toast.error("Failed to save resume");
      return false;
    }
  };

  const deleteResume = async () => {
    try {
      const { error: updateError } = await supabase
        .from("users")
        .update({ 
          resume_text: null,
          resume_file_path: null,
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      toast.success("Resume deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast.error("Failed to delete resume");
      return false;
    }
  };

  const deleteKeywords = async () => {
    try {
      const { error: updateError } = await supabase
        .from("users")
        .update({ keywords: [] })
        .eq("id", userId);

      if (updateError) throw updateError;

      toast.success("Keywords cleared successfully");
      return true;
    } catch (error) {
      console.error("Error clearing keywords:", error);
      toast.error("Failed to clear keywords");
      return false;
    }
  };

  return {
    saveResume,
    deleteResume,
    deleteKeywords,
  };
};