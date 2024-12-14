import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Map Your Career Journey
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Transform your resume into an interactive mind map of skills and experiences. 
            Perfect for IT professionals returning to the job market.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate("/signup")}
              className="bg-primary hover:bg-primary/90"
            >
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/pricing")}
            >
              View Pricing
            </Button>
          </div>
          
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="text-xl font-semibold mb-3">Resume Analysis</h3>
              <p className="text-muted-foreground">
                Upload your resume and let AI create a comprehensive skill map
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="text-xl font-semibold mb-3">Skill Mapping</h3>
              <p className="text-muted-foreground">
                Visualize your skills and their relationships in an interactive mind map
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="text-xl font-semibold mb-3">Job Match</h3>
              <p className="text-muted-foreground">
                Compare your skills against job descriptions and identify gaps
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;