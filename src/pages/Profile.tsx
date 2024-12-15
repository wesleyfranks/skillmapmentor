import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Navigate } from "react-router-dom";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ResumeEditor } from "@/components/profile/ResumeEditor";
import { KeywordAnalysis } from "@/components/profile/KeywordAnalysis";
import { useResume } from "@/hooks/useResume";
import { useUserData } from "@/hooks/useUserData";

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const {
    resumeText,
    isEditing,
    isSaving,
    isAnalyzing,
    keywords,
    setKeywords,
    setIsEditing,
    handleSaveResume,
    handleDeleteResume,
    handleDeleteKeywords,
    handleResumeTextChange,
    handleReanalyze,
    handleUpdateKeywords,
  } = useResume(user.id);

  const { isLoading } = useUserData(
    user.id,
    handleResumeTextChange,
    (loadedKeywords, loadedNonKeywords) => {
      if (loadedKeywords?.length > 0) {
        console.log('Setting initial keywords:', loadedKeywords);
        setKeywords(loadedKeywords);
      }
    }
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Profile</h1>
          <div className="space-y-4">
            <ProfileHeader user={user} isLoading={isLoading} />
            
            {!isLoading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Resume Column */}
                <div className="lg:order-first order-last space-y-6">
                  <h2 className="text-2xl font-bold text-center mb-6">Resume</h2>
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

                {/* Keywords Column */}
                <div className="lg:order-last order-first space-y-6">
                  <h2 className="text-2xl font-bold text-center mb-6">Keywords Found</h2>
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
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;