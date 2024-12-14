import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Pencil } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resumeText, setResumeText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);

  useEffect(() => {
    const fetchResumeText = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("users")
        .select("resume_text")
        .eq("id", user.id)
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching resume",
          description: error.message,
        });
        return;
      }

      if (data?.resume_text) {
        setResumeText(data.resume_text);
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

      // Split the comma-separated list into an array and trim whitespace
      const keywordList = data.keywords.split(',').map((k: string) => k.trim());
      setKeywords(keywordList);
    } catch (error) {
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
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="mt-1">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Full Name</label>
            <p className="mt-1">{user?.user_metadata?.full_name || "Not provided"}</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-muted-foreground">Resume Text</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </div>
            
            {isEditing ? (
              <>
                <Textarea
                  placeholder="Paste your resume text here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="min-h-[300px]"
                />
                <Button 
                  onClick={handleSaveResume} 
                  disabled={isSaving}
                  className="mt-2"
                >
                  {isSaving ? "Saving..." : "Save Resume"}
                </Button>
              </>
            ) : (
              <div className="whitespace-pre-wrap bg-muted p-4 rounded-md min-h-[100px]">
                {resumeText || "No resume text provided"}
              </div>
            )}
          </div>

          {resumeText && !isEditing && (
            <div className="space-y-4">
              <Button
                onClick={analyzeResume}
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? "Analyzing Resume..." : "Analyze Resume"}
              </Button>

              {keywords.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">Keywords Found</h2>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Profile;