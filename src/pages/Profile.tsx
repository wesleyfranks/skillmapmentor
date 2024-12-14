import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ResumeEditor } from "@/components/profile/ResumeEditor";
import { KeywordAnalysis } from "@/components/profile/KeywordAnalysis";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resumeText, setResumeText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [keywords, setKeywords] = useState<string[]>([]);

  useEffect(() => {
    const fetchResumeText = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("users")
          .select("resume_text")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (data?.resume_text) {
          setResumeText(data.resume_text);
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
  }, [user, toast]);

  const handleSaveResume = async () => {
    if (!user) return;
    
    setIsSaving(true);
    const { error } = await supabase
      .from("users")
      .update({ resume_text: resumeText })
      .eq("id", user.id);

    setIsSaving(false);
    setIsEditing(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error saving resume",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Success",
      description: "Your resume has been saved.",
    });
  };

  const handleDeleteResume = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("users")
        .update({ resume_text: null })
        .eq("id", user.id);

      if (error) throw error;

      setResumeText("");
      toast({
        title: "Success",
        description: "Your resume has been deleted.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting resume",
        description: error.message,
      });
    }
  };

  const analyzeResume = async () => {
    if (!resumeText) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/functions/v1/analyze-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ resumeText }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const keywordList = data.keywords.split(',').map((k: string) => k.trim());
      setKeywords(keywordList);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error analyzing resume",
        description: error.message,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        <div className="space-y-4">
          <ProfileHeader user={user} isLoading={isLoading} />
          
          {!isLoading && (
            <>
              <ResumeEditor
                resumeText={resumeText}
                isEditing={isEditing}
                isSaving={isSaving}
                onEdit={() => setIsEditing(!isEditing)}
                onSave={handleSaveResume}
                onDelete={handleDeleteResume}
                onChange={(text) => setResumeText(text)}
              />

              <KeywordAnalysis
                resumeText={resumeText}
                isAnalyzing={isAnalyzing}
                keywords={keywords}
                onAnalyze={analyzeResume}
              />
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Profile;