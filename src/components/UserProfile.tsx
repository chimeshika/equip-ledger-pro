import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentUser } from "@/hooks/useProfiles";
import { useEquipment } from "@/hooks/useEquipment";
import { User, Package, Calendar, Phone, Mail, Edit, Save, X, Lock, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ProfileAvatar from "./ProfileAvatar";
import { formatLKRShort } from "@/lib/currency";

const UserProfile = () => {
  const { data: currentUser, isLoading: isLoadingProfile, updateProfile, isUpdating, refetch } = useCurrentUser();
  const { equipment, isLoading: isLoadingEquipment } = useEquipment();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    avatar_url: "",
  });
  const [newProfileForm, setNewProfileForm] = useState({
    full_name: "",
    phone: "",
    email: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Update form data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setEditForm({
        full_name: currentUser.full_name || "",
        phone: currentUser.phone || "",
        email: currentUser.email || "",
        avatar_url: currentUser.avatar_url || "",
      });
    }
  }, [currentUser]);

  // Filter equipment created by current user
  const userEquipment = equipment.filter(item => item.created_by === currentUser?.id);

  const handleEdit = () => {
    setEditForm({
      full_name: currentUser?.full_name || "",
      phone: currentUser?.phone || "",
      email: currentUser?.email || "",
      avatar_url: currentUser?.avatar_url || "",
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!currentUser) return;

    try {
      await updateProfile(editForm);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
      // Force refetch and wait for completion
      setTimeout(async () => {
        await refetch();
      }, 500);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateProfile = async () => {
    try {
      await updateProfile(newProfileForm);
      toast({
        title: "Profile Created",
        description: "Your profile has been successfully created.",
      });
      setIsCreatingProfile(false);
      setNewProfileForm({ full_name: "", phone: "", email: "" });
      // Force refetch and wait for completion
      setTimeout(async () => {
        await refetch();
      }, 500);
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setPasswordLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Password updated successfully.",
        });
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setIsChangingPassword(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAvatarUpdate = (avatarUrl: string | null) => {
    setEditForm(prev => ({ ...prev, avatar_url: avatarUrl || "" }));
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

  // Show profile creation form if user has no profile data
  if (!currentUser || (!currentUser.full_name && !currentUser.phone)) {
    return (
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <Card className="hover:shadow-md transition-shadow duration-200 border-slate-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <UserPlus className="h-5 w-5 text-blue-600" />
              Complete Your Profile
            </CardTitle>
            <CardDescription className="text-slate-600">
              Please add your profile information to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {isCreatingProfile ? (
              <div className="space-y-6">
                <div className="flex justify-center mb-6">
                  <ProfileAvatar 
                    currentUser={currentUser} 
                    onAvatarUpdate={() => {}} 
                    isEditing={false}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="new_full_name" className="text-sm font-medium text-slate-700">
                      Full Name *
                    </Label>
                    <Input
                      id="new_full_name"
                      value={newProfileForm.full_name}
                      onChange={(e) => setNewProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Enter your full name"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new_phone" className="text-sm font-medium text-slate-700">
                      Phone Number
                    </Label>
                    <Input
                      id="new_phone"
                      value={newProfileForm.phone}
                      onChange={(e) => setNewProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter your phone number"
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="new_email" className="text-sm font-medium text-slate-700">
                      Email Address
                    </Label>
                    <Input
                      id="new_email"
                      type="email"
                      value={newProfileForm.email}
                      onChange={(e) => setNewProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email address"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleCreateProfile} 
                    size="sm" 
                    disabled={isUpdating || !newProfileForm.full_name}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isUpdating ? "Creating..." : "Create Profile"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreatingProfile(false)} 
                    size="sm" 
                    disabled={isUpdating}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <ProfileAvatar 
                  currentUser={currentUser} 
                  onAvatarUpdate={() => {}} 
                  isEditing={false}
                />
                <h3 className="text-lg font-semibold text-slate-700 mb-2 mt-4">Profile Information Missing</h3>
                <p className="text-slate-500 mb-6">Complete your profile to access all features.</p>
                <div className="space-y-2 mb-6 text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
                  <p><strong>Email:</strong> {currentUser?.email || "Not available"}</p>
                  <p><strong>Member Since:</strong> {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString() : "Unknown"}</p>
                </div>
                <Button onClick={() => setIsCreatingProfile(true)} className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Profile Information
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Password Change Section - Always available */}
        <Card className="hover:shadow-md transition-shadow duration-200 border-slate-200">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-slate-100">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Lock className="h-5 w-5 text-red-600" />
                Change Password
              </CardTitle>
              {!isChangingPassword && (
                <Button variant="outline" size="sm" onClick={() => setIsChangingPassword(true)}>
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              )}
            </div>
          </CardHeader>
          {isChangingPassword && (
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="new_password" className="text-sm font-medium text-slate-700">New Password</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                    minLength={6}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="confirm_password" className="text-sm font-medium text-slate-700">Confirm New Password</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                    minLength={6}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={handlePasswordChange} size="sm" disabled={passwordLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  }} size="sm" disabled={passwordLoading}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* User Information */}
      <Card className="hover:shadow-md transition-shadow duration-200 border-slate-200">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-slate-100">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <User className="h-5 w-5 text-green-600" />
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
        <CardContent className="p-6">
          {isEditing ? (
            <div className="space-y-6">
              <div className="flex justify-center mb-6">
                <ProfileAvatar 
                  currentUser={currentUser} 
                  onAvatarUpdate={handleAvatarUpdate} 
                  isEditing={true}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name" className="text-sm font-medium text-slate-700">Full Name</Label>
                  <Input
                    id="full_name"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter your full name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone Number</Label>
                  <Input
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email address"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex gap-3">
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
            <div className="space-y-6">
              <div className="flex justify-center mb-6">
                <ProfileAvatar 
                  currentUser={currentUser} 
                  onAvatarUpdate={() => {}} 
                  isEditing={false}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </p>
                  <p className="font-medium text-lg text-slate-800">{currentUser.full_name || "Not specified"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </p>
                  <p className="font-medium text-lg text-slate-800">{currentUser.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </p>
                  <p className="font-medium text-lg text-slate-800">{currentUser.phone || "Not specified"}</p>
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
                  <p className="font-medium text-slate-800">{new Date(currentUser.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Change Section */}
      <Card className="hover:shadow-md transition-shadow duration-200 border-slate-200">
        <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-slate-100">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Lock className="h-5 w-5 text-red-600" />
              Change Password
            </CardTitle>
            {!isChangingPassword && (
              <Button variant="outline" size="sm" onClick={() => setIsChangingPassword(true)}>
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            )}
          </div>
        </CardHeader>
        {isChangingPassword && (
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="new_password" className="text-sm font-medium text-slate-700">New Password</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                  minLength={6}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="confirm_password" className="text-sm font-medium text-slate-700">Confirm New Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                  minLength={6}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handlePasswordChange} size="sm" disabled={passwordLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {passwordLoading ? "Updating..." : "Update Password"}
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                }} size="sm" disabled={passwordLoading}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Equipment Added by User */}
      <Card className="hover:shadow-md transition-shadow duration-200 border-slate-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Package className="h-5 w-5 text-purple-600" />
            My Equipment ({userEquipment.length})
          </CardTitle>
          <CardDescription className="text-slate-600">
            Equipment items you have added to the system
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoadingEquipment ? (
            <div className="text-center py-8">
              <div className="animate-pulse">
                <div className="text-slate-600">Loading your equipment...</div>
              </div>
            </div>
          ) : userEquipment.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-white" />
              </div>
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
                        <h3 className="font-semibold text-slate-800">{item.item_name}</h3>
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
                        <p className="font-medium text-slate-700">{item.assigned_to || "Unassigned"}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Location</p>
                        <p className="font-medium text-slate-700">{item.location || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Price (LKR)</p>
                        <p className="font-medium text-slate-700">{item.price ? formatLKRShort(item.price) : "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Supplier</p>
                        <p className="font-medium text-slate-700">{item.supplier || "Not specified"}</p>
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
