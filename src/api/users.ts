import { supabase } from "../integrations/supabase/client"; // Corrected import path
import { toast } from "sonner";

export interface UserData {
  fullName: string;
  email: string;
  userId: string;
}

export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    console.log('[API] Fetching user info for user:', userId);

    const { data, error } = await supabase
      .from('users') // Assuming user info is now in a separate 'users' table
      .select('full_name, email')
      .eq('id', userId)
      .single();

    if (error) {
      toast.error('Failed to fetch user information.');
      throw error;
    }

    console.log('[API] Fetched user info:', data);

    return {
      fullName: data.full_name,
      email: data.email,
      userId: userId,
    };
  } catch (err) {
    console.error('[API] Error fetching user info:', err);
    return null;
  }
};
