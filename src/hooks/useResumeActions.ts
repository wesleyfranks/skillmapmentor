import { updateUserResume, deleteUserKeywords } from "@/api/users";
import { toast } from "sonner";

export const useResumeActions = (userId: string) => {
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

  const deleteKeywords = async () => {
    try {
      const success = await deleteUserKeywords(userId);
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
    deleteKeywords,
  };
};