import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resumeText, setResumeText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
            <label className="text-sm font-medium text-muted-foreground">Resume Text</label>
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
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;