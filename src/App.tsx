import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Header } from "./components/layout/Header";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Pricing from "./pages/Pricing";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  // Don't render routes until auth state is determined
  if (loading) {
    return null;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/profile" replace /> : <Index />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/login" element={user ? <Navigate to="/profile" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/profile" replace /> : <Signup />} />
      <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Header />
            <AppRoutes />
          </div>
          <Toaster />
          <Sonner />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;