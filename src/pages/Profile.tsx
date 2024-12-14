import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="mt-1">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Full Name</label>
            <p className="mt-1">{user?.user_metadata?.full_name || 'Not provided'}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;