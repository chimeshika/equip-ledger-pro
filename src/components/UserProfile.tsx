
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentUser } from "@/hooks/useProfiles";
import { useEquipment } from "@/hooks/useEquipment";
import { User, Package, Calendar, Phone, Mail, Edit, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UserProfile = () => {
  const { data: currentUser, isLoading: isLoadingProfile, updateProfile, isUpdating } = useCurrentUser();
  const { equipment, isLoading: isLoadingEquipment } = useEquipment();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: "",
  });

  // Filter equipment created by current user
  const userEquipment = equipment.filter(item => item.created_by === currentUser?.id);

  const handleEdit = () => {
    setEditForm({
      full_name: currentUser?.full_name || "",
      phone: currentUser?.phone || "",
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!currentUser) return;

    try {
      updateProfile(editForm);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse">
          <div className="text-lg text-slate-600">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="p-6 animate-fade-in">
          <CardContent className="text-center">
            <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-600 mb-2">Profile Not Found</h3>
            <p className="text-slate-600">Unable to load your profile information.</p>
            <p className="text-sm text-slate-500 mt-2">Try refreshing the page or contact support if the issue persists.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* User Information */}
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} size="sm" disabled={isUpdating}>
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdating ? "Saving..." : "Save"}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} size="sm" disabled={isUpdating}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </p>
                <p className="font-medium text-lg">{currentUser.full_name || "Not specified"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </p>
                <p className="font-medium text-lg">{currentUser.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </p>
                <p className="font-medium text-lg">{currentUser.phone || "Not specified"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Role</p>
                <Badge variant={currentUser.role === 'admin' ? 'default' : 'secondary'} className="text-sm">
                  {currentUser.role === 'admin' ? 'Administrator' : 'User'}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Member Since
                </p>
                <p className="font-medium">{new Date(currentUser.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Equipment Added by User */}
      <Card className="hover:shadow-md transition-shadow duration-200">
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
              <div className="animate-pulse">
                <div className="text-slate-600">Loading your equipment...</div>
              </div>
            </div>
          ) : userEquipment.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">You haven't added any equipment yet.</p>
              <p className="text-sm text-slate-400 mt-1">Start by adding your first piece of equipment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userEquipment.map((item) => (
                <Card key={item.id} className="border-l-4 border-l-blue-400 hover:shadow-sm transition-all duration-200">
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
