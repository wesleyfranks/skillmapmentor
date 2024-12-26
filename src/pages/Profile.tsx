import { useAuth } from "../contexts/AuthContext";
import { Card } from "../components/ui/card";
import { Navigate } from "react-router-dom";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { ResumeContent } from "../components/profile/resume/ResumeContent";
import { KeywordAnalysis } from "../components/profile/keywords/KeywordAnalysis";
import { useResume } from "../hooks/useResume";
import { useState } from "react";
import { uploadResume, insertResume } from "../api/users/mutations";
import { supabase } from "../integrations/supabase/client"; // Adjust the import path as necessary
import { toast } from "sonner";

const Profile = () => {
  const { user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [resumes, setResumes] = useState([]);

  if (!user) {
    console.log('[Profile] No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('[Profile] Rendering for user:', user.id);

  const {
    resumeText,
    isEditing,
    isSaving,
    isAnalyzing,
    keywords,
    nonKeywords,
    isLoading,
    setIsEditing,
    handleSaveResume,
    handleDeleteKeywords,
    handleResumeTextChange,
    handleReanalyze,
    handleUpdateKeywords,
    handleAddToNonKeywords,
  } = useResume(user.id);

  console.log('[Profile] Current state:', {
    hasResumeText: !!resumeText,
    keywordsCount: keywords.length,
    nonKeywordsCount: nonKeywords.length,
    isLoading,
    isEditing,
    isAnalyzing
  });

  const handleDeleteResume = async (resumeFilePath: string) => {
    try {
      const userId = user.id;

      // Delete the file from Supabase storage
      const { error: deleteFileError } = await supabase.storage
        .from('resumes')
        .remove([resumeFilePath]);

      if (deleteFileError) {
        console.error("Error deleting resume file:", deleteFileError);
        toast.error("Failed to delete resume file");
        return;
      }

      // Delete the corresponding entry in the resume table
      const { error: deleteEntryError } = await supabase
        .from('resumes')
        .delete()
        .eq('user_id', userId)
        .eq('file_path', resumeFilePath);

      if (deleteEntryError) {
        console.error("Error deleting resume entry:", deleteEntryError);
        toast.error("Failed to delete resume entry");
        return;
      }

      // Nullify the column in the user table
      await supabase
        .from('users')
        .update({ resume_file_path: null })
        .eq('user_id', userId);

      toast.success("Resume deleted successfully");
    } catch (error) {
      console.error("Error during resume deletion:", error);
      toast.error("An error occurred while deleting the resume");
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsUploading(true);
    const file = event.target.files?.[0];
    if (!file) {
      setIsUploading(false);
      return;
    }

    try {
      const uploadSuccess = await uploadResume(user.id, file); // Upload resume to Supabase
      if (uploadSuccess) {
        // Insert resume entry into the database
        const filePath = `${user.id}/${new Date().getTime()}-${file.name}`;
        await insertResume(user.id, filePath); // Insert resume entry
        setResumes((prev) => [...prev, { file_path: filePath }]); // Store the file path
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        handleResumeTextChange(text);
      };
      reader.readAsText(file);
    } catch (error) {
      console.error("Error uploading resume:", error)
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Profile</h1>
          <div className="space-y-4 mb-8">
            <ProfileHeader user={user} isLoading={isLoading} />
          </div>

          {!isLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="order-1">
                <h2 className="text-2xl font-bold text-center mb-6">Keywords</h2>
                <div className="h-full">
                  <KeywordAnalysis
                    resumeText={resumeText}
                    isAnalyzing={isAnalyzing}
                    keywords={keywords}
                    onReanalyze={handleReanalyze}
                    onDeleteKeywords={handleDeleteKeywords}
                    onUpdateKeywords={handleUpdateKeywords}
                    onAddToNonKeywords={handleAddToNonKeywords}
                  />
                </div>
              </div>

              <div className="order-2">
                <h2 className="text-2xl font-bold text-center mb-6">Resume</h2>
                <div className="h-full">
                  <ResumeContent
                    isEditing={isEditing}
                    resumeText={resumeText}
                    onChange={handleResumeTextChange}
                    onSave={() => handleSaveResume(resumeText)}
                    isSaving={isSaving}
                    onEdit={() => setIsEditing(!isEditing)}
                    onUpload={handleUpload}
                    isUploading={isUploading}
                    showDeleteDialog={showDeleteDialog}
                    setShowDeleteDialog={setShowDeleteDialog}
                    onDelete={() => handleDeleteResume(resumes[0]?.file_path)} // Pass the correct file path here
                  />
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Profile;

