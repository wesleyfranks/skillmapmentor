import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground mb-12">
            Start with a free analysis or choose a subscription for continuous career growth
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Free Trial</CardTitle>
                <CardDescription>Perfect for first-time users</CardDescription>
              </CardHeader>
              <CardContent className="text-left">
                <div className="text-3xl font-bold mb-6">$0</div>
                <ul className="space-y-2">
                  <li>✓ One resume analysis</li>
                  <li>✓ Basic mind map</li>
                  <li>✓ Core skill insights</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => navigate("/signup")}
                >
                  Get Started
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-primary">
              <CardHeader>
                <CardTitle>6 Months</CardTitle>
                <CardDescription>Most popular choice</CardDescription>
              </CardHeader>
              <CardContent className="text-left">
                <div className="text-3xl font-bold mb-6">$49</div>
                <ul className="space-y-2">
                  <li>✓ Unlimited analyses</li>
                  <li>✓ Advanced mind mapping</li>
                  <li>✓ Job description matching</li>
                  <li>✓ Skill development tracking</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => navigate("/signup")}
                >
                  Choose Plan
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>12 Months</CardTitle>
                <CardDescription>Best value</CardDescription>
              </CardHeader>
              <CardContent className="text-left">
                <div className="text-3xl font-bold mb-6">$89</div>
                <ul className="space-y-2">
                  <li>✓ Everything in 6 Months</li>
                  <li>✓ Priority support</li>
                  <li>✓ Custom export formats</li>
                  <li>✓ Early access to features</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => navigate("/signup")}
                >
                  Choose Plan
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;