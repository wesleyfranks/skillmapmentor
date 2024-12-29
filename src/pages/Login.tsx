import { LoginForm } from '@/components/auth';
import { Button } from '@/ui/button';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <LoginForm />
        <p className="text-center mt-4 text-muted-foreground">
          Don't have an account?{' '}
          <Button variant="link" onClick={() => navigate('/signup')}>
            Sign up
          </Button>
        </p>
      </div>
    </div>
  );
};

export default Login;
