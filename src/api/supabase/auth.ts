import { supabase } from '@/api/supabase/client';
import { toast } from 'sonner';

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data?.user) {
      toast.success('Welcome back!');
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('[Auth] Sign in error:', error);
    toast.error(error.message);
    return { data: null, error };
  }
};

export const signUp = async (
  email: string,
  password: string,
  fullName: string
) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      // Handle specific Supabase error codes for duplicate emails
      if (
        error.status === 400 &&
        error.message.includes('already registered')
      ) {
        toast.error(
          'This email is already registered. Please try logging in instead.',
          {
            description: 'Use the login form if you already have an account.',
          }
        );
      } else {
        toast.error(error.message);
      }
      throw error;
    }

    if (data?.user) {
      toast.success('Account created successfully!');
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('[Auth] Sign up error:', error);
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    toast.success('Signed out successfully');
    return { error: null };
  } catch (error: any) {
    console.error('[Auth] Sign out error:', error);
    toast.error(error.message);
    return { error };
  }
};
