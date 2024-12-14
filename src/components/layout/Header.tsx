import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const Header = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 
            onClick={() => navigate("/")}
            className="text-2xl font-bold text-primary cursor-pointer"
          >
            SkillMap Pro
          </h1>
        </div>
        <nav className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/pricing")}
          >
            Pricing
          </Button>
          {user ? (
            <>
              <Button
                variant="ghost"
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
              <Button
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};