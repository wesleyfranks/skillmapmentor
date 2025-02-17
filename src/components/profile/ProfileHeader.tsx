import { User } from "@supabase/supabase-js";
import { Skeleton } from "@/ui/skeleton";

interface ProfileHeaderProps {
  user: User | null;
  isLoading: boolean;
}

export const ProfileHeader = ({ user, isLoading }: ProfileHeaderProps) => {
  if (isLoading) {
    return (
      <>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-48" />
        </div>
      </>
    );
  }

  return (
    <>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Email</label>
        <p className="mt-1">{user?.email}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
        <p className="mt-1">{user?.user_metadata?.full_name || "Not provided"}</p>
      </div>
    </>
  );
};