import { SignUpForm } from "@/components/auth/AuthForms";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <SignUpForm />
        <p className="text-center mt-4 text-muted-foreground">
          Already have an account?{" "}
          <Button variant="link" onClick={() => navigate("/login")}>
            Sign in
          </Button>
        </p>
      </div>
    </div>
  );
};

export default Signup;