import { updateUserResume, deleteUserKeywords, deleteUserKeyword } from "@/api/supabase/resumes";
import { toast } from "sonner";

export const useResumeActions = (resumeId: string, userId: string) => {
  const saveResume = async (resumeText: string) => {
    try {
      const success = await updateUserResume(userId, resumeText);
      if (success) {
        toast.success("Resume saved successfully");
      }
      return success;
    } catch (error) {
      console.error("Error saving resume:", error);
      toast.error("Failed to save resume");
      return false;
    }
  };

  const deleteResume = async () => {
    try {
      const success = await updateUserResume(userId, null);
      if (success) {
        toast.success("Resume deleted successfully");
      }
      return success;
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast.error("Failed to delete resume");
      return false;
    }
  };

  // Create a function that deletes a single keyword
  // This function should call the deleteUserKeyword function
  // and display a success or error toast
  // The function should return a boolean
  // indicating whether the keyword was deleted successfully
  // The function should accept the resume ID, user ID, and keyword as arguments
  const deleteKeyword = async (resumeId: string, userId: string, keyword: string) => {
    try {
      const success = await deleteUserKeyword(resumeId, userId, keyword);
      if (success) {
        toast.success("Keyword deleted successfully");
      }
      return success;
    } catch (error) {
      console.error("Error deleting keyword:", error);
      toast.error("Failed to delete keyword");
      return false;
    }
  };

  const deleteKeywords = async () => {
    try {
      const success = await deleteUserKeywords(resumeId, userId);
      if (success) {
        toast.success("Keywords cleared successfully");
      }
      return success;
    } catch (error) {
      console.error("Error clearing keywords:", error);
      toast.error("Failed to clear keywords");
      return false;
    }
  };

  return {
    saveResume,
    deleteResume,
    deleteKeyword,
    deleteKeywords
  };
};