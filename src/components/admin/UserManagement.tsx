
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users } from "lucide-react";
import { useProfiles, useCurrentUser } from "@/hooks/useProfiles";

const UserManagement = () => {
  const { data: currentUser } = useCurrentUser();
  const { profiles, updateRole, isUpdatingRole } = useProfiles();

  const handleRoleUpdate = (userId: string, newRole: 'admin' | 'user') => {
    updateRole({ userId, role: newRole });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management
        </CardTitle>
        <CardDescription>
          Manage user roles and permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {profiles.map((profile) => (
            <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{profile.full_name || profile.email}</p>
                <p className="text-sm text-slate-500">{profile.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                  {profile.role}
                </Badge>
                <Select
                  value={profile.role}
                  onValueChange={(value: 'admin' | 'user') => handleRoleUpdate(profile.id, value)}
                  disabled={isUpdatingRole || profile.id === currentUser?.id}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
