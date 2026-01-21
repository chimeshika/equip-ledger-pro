
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { profileUpdateSchema } from '@/lib/validation';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export type AppRole = 'admin' | 'user' | 'branch_head' | 'it_unit' | 'officer';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface ProfileWithRole extends Profile {
  role?: AppRole;
}

export const useProfiles = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      if (!user) return [];

      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Merge profiles with their roles
      const profilesWithRoles: ProfileWithRole[] = profilesData.map(profile => {
        const userRole = rolesData.find(r => r.user_id === profile.id);
        return {
          ...profile,
          role: userRole?.role || 'user'
        };
      });

      return profilesWithRoles;
    },
    enabled: !!user,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      if (!user) throw new Error('User not authenticated');

      // Delete existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Insert new role
      const { data, error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast({
        title: "Role Updated",
        description: "User role has been successfully updated.",
      });
    },
    onError: (error) => {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    profiles,
    isLoading,
    updateRole: updateRoleMutation.mutate,
    isUpdatingRole: updateRoleMutation.isPending,
  };
};

export const useCurrentUser = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: currentUser, isLoading, refetch } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (roleError) throw roleError;

      return {
        ...profileData,
        role: roleData?.role || 'user'
      } as ProfileWithRole;
    },
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: { 
      full_name?: string; 
      phone?: string; 
      avatar_url?: string | null;
      email?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Validate profile data
      const validationResult = profileUpdateSchema.safeParse(profileData);
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0].message);
      }

      // If email is being updated, update auth user email
      if (validationResult.data.email && validationResult.data.email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: validationResult.data.email
        });
        if (authError) throw authError;
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...validationResult.data,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });

  return {
    data: currentUser,
    isLoading,
    refetch,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
  };
};
