import { Toaster } from '@/ui/toaster';
import { Toaster as Sonner } from '@/ui/sonner';
import { TooltipProvider } from '@/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './api/supabase/AuthContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Pricing from './pages/Pricing';
import { ResumeProvider } from '@/components/profile/resume/ResumeContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/profile" replace /> : <Index />}
      />
      <Route path="/pricing" element={<Pricing />} />
      <Route
        path="/login"
        element={user ? <Navigate to="/profile" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/profile" replace /> : <Signup />}
      />
      <Route
        path="/profile"
        element={
          user ? (
            <ResumeProvider>
              <Profile />
            </ResumeProvider>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1">
              <AppRoutes />
            </main>
            <Footer />
          </div>
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
