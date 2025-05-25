
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/hooks/useProfiles";
import { useEquipment } from "@/hooks/useEquipment";
import { User, Package, Calendar } from "lucide-react";

const UserProfile = () => {
  const { data: currentUser, isLoading: isLoadingProfile } = useCurrentUser();
  const { equipment, isLoading: isLoadingEquipment } = useEquipment();

  // Filter equipment created by current user
  const userEquipment = equipment.filter(item => item.created_by === currentUser?.id);

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-slate-600">Loading profile...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="p-6">
          <CardContent className="text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Profile Not Found</h3>
            <p className="text-slate-600">Unable to load your profile information.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-500">Full Name</p>
              <p className="font-medium text-lg">{currentUser.full_name || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="font-medium text-lg">{currentUser.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Role</p>
              <Badge variant={currentUser.role === 'admin' ? 'default' : 'secondary'} className="text-sm">
                {currentUser.role === 'admin' ? 'Administrator' : 'User'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-slate-500">Member Since</p>
              <p className="font-medium">{new Date(currentUser.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Added by User */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            My Equipment ({userEquipment.length})
          </CardTitle>
          <CardDescription>
            Equipment items you have added to the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingEquipment ? (
            <div className="text-center py-8">
              <div className="text-slate-600">Loading your equipment...</div>
            </div>
          ) : userEquipment.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">You haven't added any equipment yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userEquipment.map((item) => (
                <Card key={item.id} className="border-l-4 border-l-blue-400">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{item.item_name}</h3>
                        <p className="text-sm text-slate-600">{item.brand} - {item.category}</p>
                        <p className="text-xs text-slate-500">Serial: {item.serial_number}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{item.condition}</Badge>
                        <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-slate-500">Assigned To</p>
                        <p className="font-medium">{item.assigned_to || "Unassigned"}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Location</p>
                        <p className="font-medium">{item.location || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Price</p>
                        <p className="font-medium">${item.price || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Supplier</p>
                        <p className="font-medium">{item.supplier || "Not specified"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
