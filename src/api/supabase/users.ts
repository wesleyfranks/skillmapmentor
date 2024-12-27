import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';
import { handleError } from '../../helpers/handleError';

export interface UserData {
  fullName: string;
  email: string;
  userId: string;
}

export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('full_name, email')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return { fullName: data.full_name, email: data.email, userId };
  } catch (error) {
    handleError(error, 'Failed to fetch user data');
    return null;
  }
};

export const updateUserData = async (
  userId: string,
  data: Partial<UserData>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .update(data)
      .eq('id', userId);
    if (error) throw error;
    toast.success('User data updated successfully');
    return true;
  } catch (error) {
    handleError(error, 'Failed to update user data');
    return false;
  }
};
