import { toast } from 'sonner';

export const handleError = (error: any, customMessage: string) => {
  console.error(`[API] ${customMessage}:`, error);
  if (error.code === '42501') {
    toast.error("You don't have permission to perform this action");
  } else {
    toast.error(customMessage);
  }
};
