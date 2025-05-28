
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, X } from "lucide-react";

interface ProfileAvatarProps {
  currentUser: any;
  onAvatarUpdate: (avatarUrl: string | null) => void;
  isEditing: boolean;
}

const ProfileAvatar = ({ currentUser, onAvatarUpdate, isEditing }: ProfileAvatarProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size must be less than 5MB.",
          variant: "destructive",
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      onAvatarUpdate(data.publicUrl);

      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload image.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = () => {
    onAvatarUpdate(null);
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
          <AvatarImage 
            src={currentUser?.avatar_url} 
            alt={currentUser?.full_name || "Profile"} 
          />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-semibold">
            {getInitials(currentUser?.full_name)}
          </AvatarFallback>
        </Avatar>
        
        {isEditing && (
          <div className="absolute -bottom-2 -right-2">
            <label htmlFor="avatar-upload" className="cursor-pointer">
              <div className="bg-blue-600 hover:bg-blue-700 rounded-full p-2 shadow-lg transition-colors">
                <Camera className="h-4 w-4 text-white" />
              </div>
            </label>
            <Input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={uploadAvatar}
              disabled={uploading}
              className="hidden"
            />
          </div>
        )}
      </div>

      {isEditing && (
        <div className="flex gap-2">
          <label htmlFor="avatar-upload" className="cursor-pointer">
            <Button variant="outline" size="sm" disabled={uploading} asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Uploading..." : "Upload Image"}
              </span>
            </Button>
          </label>
          
          {currentUser?.avatar_url && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={removeAvatar}
              disabled={uploading}
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileAvatar;
