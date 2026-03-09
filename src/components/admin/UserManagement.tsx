
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users } from "lucide-react";
import { useProfiles, useCurrentUser } from "@/hooks/useProfiles";
import { ROLE_LABELS, ALL_ROLES } from "@/lib/roles";
import type { AppRole } from "@/lib/roles";

const UserManagement = () => {
  const { data: currentUser } = useCurrentUser();
  const { profiles, updateRole, isUpdatingRole } = useProfiles();

  const handleRoleUpdate = (userId: string, newRole: AppRole) => {
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
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                  {ROLE_LABELS[profile.role || 'user']}
                </Badge>
                <Select
                  value={profile.role || 'user'}
                  onValueChange={(value: string) => handleRoleUpdate(profile.id, value as AppRole)}
                  disabled={isUpdatingRole || profile.id === currentUser?.id}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </SelectItem>
                    ))}
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
