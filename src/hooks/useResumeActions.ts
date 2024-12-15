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
      // First, get the current user data including keywords
      const { data: currentUser, error: fetchError } = await supabase
        .from("users")
        .select("keywords")
        .eq("id", userId)
        .single();

      if (fetchError) throw fetchError;

      console.log('Current user keywords before delete:', currentUser?.keywords);

      // Update only resume-related fields while explicitly preserving keywords
      const { error: updateError } = await supabase
        .from("users")
        .update({ 
          resume_text: null,
          resume_file_path: null,
          keywords: currentUser?.keywords // Keep existing keywords unchanged
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      // Verify the update
      const { data: verifyUser, error: verifyError } = await supabase
        .from("users")
        .select("keywords")
        .eq("id", userId)
        .single();

      if (verifyError) throw verifyError;

      console.log('User keywords after delete:', verifyUser?.keywords);

      toast.success("Resume deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast.error("Failed to delete resume");
      return false;
    }
  };

  return {
    saveResume,
    deleteResume,
  };
};