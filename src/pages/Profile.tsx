import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Navigate } from "react-router-dom";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ResumeContent } from "@/components/profile/resume/ResumeContent";
import { ResumeToolbar } from "@/components/profile/resume/ResumeToolbar";
import { KeywordAnalysis } from "@/components/profile/keywords/KeywordAnalysis";
import { useResume } from "@/hooks/useResume";
import { useState } from "react";

const Profile = () => {
  const { user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
    isLoading,
    setIsEditing,
    handleSaveResume,
    handleDeleteResume,
    handleDeleteKeywords,
    handleResumeTextChange,
    handleReanalyze,
    handleUpdateKeywords,
  } = useResume(user.id);

  console.log('[Profile] Current state:', {
    hasResumeText: !!resumeText,
    keywordsCount: keywords.length,
    isLoading,
    isEditing,
    isAnalyzing
  });

  const handleUpload = () => {
    setIsUploading(true);
    // Implement upload functionality here
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
                  />
                </div>
              </div>

              <div className="order-2">
                <h2 className="text-2xl font-bold text-center mb-6">Resume</h2>
                <div className="h-full">
                  <ResumeToolbar
                    resumeText={resumeText}
                    isEditing={isEditing}
                    isUploading={isUploading}
                    onEdit={() => setIsEditing(!isEditing)}
                    onUpload={handleUpload}
                    showDeleteDialog={showDeleteDialog}
                    setShowDeleteDialog={setShowDeleteDialog}
                    onDelete={handleDeleteResume}
                  />
                  <ResumeContent
                    isEditing={isEditing}
                    resumeText={resumeText}
                    onChange={handleResumeTextChange}
                    onSave={() => handleSaveResume(resumeText)}
                    isSaving={isSaving}
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
