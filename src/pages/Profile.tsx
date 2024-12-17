import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Navigate } from "react-router-dom";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ResumeEditor } from "@/components/profile/ResumeEditor";
import { KeywordAnalysis } from "@/components/profile/KeywordAnalysis";
import { useResume } from "@/hooks/useResume";

const Profile = () => {
  const { user } = useAuth();

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
              <div className="order-2 lg:order-1">
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

              <div className="order-1 lg:order-2">
                <h2 className="text-2xl font-bold text-center mb-6">Resume</h2>
                <div className="h-full">
                  <ResumeEditor
                    resumeText={resumeText}
                    isEditing={isEditing}
                    isSaving={isSaving}
                    onEdit={() => setIsEditing(!isEditing)}
                    onSave={handleSaveResume}
                    onDelete={handleDeleteResume}
                    onChange={handleResumeTextChange}
                    userId={user.id}
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