import { Button } from "@/ui/button";
import { useNavigate } from "react-router-dom";
import { Card } from "@/ui/card";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            SkillMap Pro
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Transform your resume into an interactive mind map of skills and experiences. 
            Perfect for IT professionals returning to the job market.
          </p>
          <div className="flex justify-center gap-4 mb-12">
            <Button
              size="lg"
              onClick={() => navigate("/signup")}
              className="bg-primary hover:bg-primary/90"
            >
              Try For Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/pricing")}
            >
              View Plans
            </Button>
          </div>
          
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3">Resume Analysis</h3>
              <p className="text-muted-foreground">
                Upload your resume or paste your experience, and let AI create a comprehensive skill map
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3">Skill Mapping</h3>
              <p className="text-muted-foreground">
                Visualize your skills and their relationships in an interactive mind map with detailed insights
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3">Job Match</h3>
              <p className="text-muted-foreground">
                Compare your skills against job descriptions and identify gaps with AI-powered analysis
              </p>
            </Card>
          </div>

          <div className="mt-12 p-8 bg-card rounded-lg border">
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              <div>
                <div className="text-primary font-bold mb-2">1. Upload Resume</div>
                <p className="text-muted-foreground">Upload your resume or manually input your experience</p>
              </div>
              <div>
                <div className="text-primary font-bold mb-2">2. Generate Mind Map</div>
                <p className="text-muted-foreground">AI analyzes your experience and creates an interactive skill map</p>
              </div>
              <div>
                <div className="text-primary font-bold mb-2">3. Explore Skills</div>
                <p className="text-muted-foreground">Deep dive into each skill with definitions and real-world examples</p>
              </div>
              <div>
                <div className="text-primary font-bold mb-2">4. Match Jobs</div>
                <p className="text-muted-foreground">Compare your skills with job descriptions and identify opportunities</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;