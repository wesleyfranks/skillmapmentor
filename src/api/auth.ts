import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data?.user) {
      toast.success("Welcome back!");
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('[Auth] Sign in error:', error);
    toast.error(error.message);
    return { data: null, error };
  }
};

export const signUp = async (email: string, password: string, fullName: string) => {
  try {
    // First check if the email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      toast.error("This email is already registered. Please try logging in instead.");
      return { data: null, error: new Error("Email already registered") };
    }

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
      // Handle specific Supabase error codes
      if (error.message.includes("User already registered")) {
        toast.error("This email is already registered. Please try logging in instead.");
      } else {
        toast.error(error.message);
      }
      throw error;
    }

    if (data?.user) {
      toast.success("Account created successfully!");
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
    
    toast.success("Signed out successfully");
    return { error: null };
  } catch (error: any) {
    console.error('[Auth] Sign out error:', error);
    toast.error(error.message);
    return { error };
  }
};