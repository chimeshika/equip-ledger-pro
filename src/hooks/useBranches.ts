import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export interface Branch {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserBranchAssignment {
  id: string;
  user_id: string;
  branch_id: string;
  requested_role: 'admin' | 'user' | 'branch_head' | 'it_unit' | 'officer';
  status: string;
  approved_by?: string;
  approved_at?: string;
  designation?: string | null;
  post_order?: number | null;
  supervisor_id?: string | null;
  created_at: string;
  updated_at: string;
  branch?: Branch;
  profile?: {
    id: string;
    email: string;
    full_name?: string;
  };
  supervisor?: {
    id: string;
    full_name?: string | null;
  } | null;
}

export const useBranches = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name', { ascending: true });
      if (error) { if (import.meta.env.DEV) console.error('Error fetching branches:', error); throw error; }
      return data as Branch[];
    },
    enabled: !!user,
  });

  const addBranchMutation = useMutation({
    mutationFn: async (branchData: Omit<Branch, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase.from('branches').insert([branchData]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['branches'] }); toast({ title: "Branch Created", description: "Branch has been successfully created." }); },
    onError: (error: any) => { if (import.meta.env.DEV) console.error('Error adding branch:', error); toast({ title: "Error", description: error.message || "Failed to create branch.", variant: "destructive" }); },
  });

  const updateBranchMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Branch> & { id: string }) => {
      if (!user) throw new Error('User not authenticated');
      const { data: updated, error } = await supabase.from('branches').update(data).eq('id', id).select().single();
      if (error) throw error;
      return updated;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['branches'] }); toast({ title: "Branch Updated", description: "Branch has been successfully updated." }); },
    onError: (error: any) => { if (import.meta.env.DEV) console.error('Error updating branch:', error); toast({ title: "Error", description: error.message || "Failed to update branch.", variant: "destructive" }); },
  });

  const deleteBranchMutation = useMutation({
    mutationFn: async (branchId: string) => {
      if (!user) throw new Error('User not authenticated');
      const { error } = await supabase.from('branches').delete().eq('id', branchId);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['branches'] }); toast({ title: "Branch Deleted", description: "Branch has been successfully deleted." }); },
    onError: (error: any) => { if (import.meta.env.DEV) console.error('Error deleting branch:', error); toast({ title: "Error", description: error.message || "Failed to delete branch.", variant: "destructive" }); },
  });

  return {
    branches, isLoading,
    addBranch: addBranchMutation.mutate, isAdding: addBranchMutation.isPending,
    updateBranch: updateBranchMutation.mutate, isUpdating: updateBranchMutation.isPending,
    deleteBranch: deleteBranchMutation.mutate, isDeleting: deleteBranchMutation.isPending,
  };
};

export const useApprovedUsers = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['approvedUsers'],
    queryFn: async () => {
      if (!user) return [];
      // Get all approved assignments to find their user IDs and designations
      const { data: assignments, error: aErr } = await supabase
        .from('user_branch_assignments')
        .select('user_id, designation')
        .eq('status', 'approved');
      if (aErr) throw aErr;
      if (!assignments || assignments.length === 0) return [];

      const userIds = assignments.map(a => a.user_id);
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
      if (pErr) throw pErr;

      const designationMap = new Map(assignments.map(a => [a.user_id, a.designation]));
      return (profiles || []).map(p => ({
        id: p.id,
        full_name: p.full_name,
        designation: designationMap.get(p.id) || null,
      }));
    },
    enabled: !!user,
  });
};

export const useUserBranchAssignment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assignment, isLoading } = useQuery({
    queryKey: ['userBranchAssignment', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_branch_assignments')
        .select(`*, branch:branches(*)`)
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) { if (import.meta.env.DEV) console.error('Error fetching user branch assignment:', error); throw error; }
      return data as UserBranchAssignment | null;
    },
    enabled: !!user,
  });

  const requestAssignmentMutation = useMutation({
    mutationFn: async ({ branchId, requestedRole, designation }: {
      branchId: string; requestedRole: AppRole; designation?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('user_branch_assignments')
        .insert({
          user_id: user.id,
          branch_id: branchId,
          requested_role: requestedRole,
          status: 'pending',
          designation: designation || null,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBranchAssignment'] });
      toast({ title: "Request Submitted", description: "Your branch assignment request has been submitted for approval." });
    },
    onError: (error: any) => {
      if (import.meta.env.DEV) console.error('Error requesting assignment:', error);
      toast({ title: "Error", description: error.message || "Failed to submit request.", variant: "destructive" });
    },
  });

  return {
    assignment, isLoading,
    requestAssignment: requestAssignmentMutation.mutate,
    isRequesting: requestAssignmentMutation.isPending,
  };
};

export const useBranchAssignments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['branchAssignments'],
    queryFn: async () => {
      if (!user) return [];

      const { data: assignmentsData, error } = await supabase
        .from('user_branch_assignments')
        .select(`*, branch:branches(*)`)
        .order('created_at', { ascending: false });
      if (error) { if (import.meta.env.DEV) console.error('Error fetching branch assignments:', error); throw error; }
      if (!assignmentsData || assignmentsData.length === 0) return [];

      // Fetch profiles for users
      const userIds = assignmentsData.map(a => a.user_id);

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

      return assignmentsData.map(assignment => ({
        ...assignment,
        profile: profilesMap.get(assignment.user_id),
      })) as unknown as UserBranchAssignment[];
    },
    enabled: !!user,
  });

  const approveAssignmentMutation = useMutation({
    mutationFn: async ({ assignmentId, userId, role }: { assignmentId: string; userId: string; role: AppRole }) => {
      if (!user) throw new Error('User not authenticated');
      const { error: assignmentError } = await supabase
        .from('user_branch_assignments')
        .update({ status: 'approved', approved_by: user.id, approved_at: new Date().toISOString() })
        .eq('id', assignmentId);
      if (assignmentError) throw assignmentError;

      await supabase.from('user_roles').delete().eq('user_id', userId);
      const { error: roleError } = await supabase.from('user_roles').insert({ user_id: userId, role });
      if (roleError) throw roleError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branchAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast({ title: "Assignment Approved", description: "User has been assigned to the branch." });
    },
    onError: (error: any) => {
      if (import.meta.env.DEV) console.error('Error approving assignment:', error);
      toast({ title: "Error", description: error.message || "Failed to approve assignment.", variant: "destructive" });
    },
  });

  const rejectAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      if (!user) throw new Error('User not authenticated');
      const { error } = await supabase
        .from('user_branch_assignments')
        .update({ status: 'rejected', approved_by: user.id, approved_at: new Date().toISOString() })
        .eq('id', assignmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branchAssignments'] });
      toast({ title: "Assignment Rejected", description: "User assignment request has been rejected." });
    },
    onError: (error: any) => {
      if (import.meta.env.DEV) console.error('Error rejecting assignment:', error);
      toast({ title: "Error", description: error.message || "Failed to reject assignment.", variant: "destructive" });
    },
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: async ({ assignmentId, userId }: { assignmentId: string; userId: string }) => {
      if (!user) throw new Error('User not authenticated');
      const { error } = await supabase
        .from('user_branch_assignments')
        .delete()
        .eq('id', assignmentId);
      if (error) throw error;
      // Also clean up the user's role back to default 'user'
      await supabase.from('user_roles').delete().eq('user_id', userId);
      await supabase.from('user_roles').insert({ user_id: userId, role: 'user' as AppRole });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branchAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast({ title: "Assignment Deleted", description: "User assignment has been removed." });
    },
    onError: (error: any) => {
      if (import.meta.env.DEV) console.error('Error deleting assignment:', error);
      toast({ title: "Error", description: error.message || "Failed to delete assignment.", variant: "destructive" });
    },
  });

  return {
    assignments, isLoading,
    approveAssignment: approveAssignmentMutation.mutate, isApproving: approveAssignmentMutation.isPending,
    rejectAssignment: rejectAssignmentMutation.mutate, isRejecting: rejectAssignmentMutation.isPending,
    deleteAssignment: deleteAssignmentMutation.mutate, isDeleting: deleteAssignmentMutation.isPending,
  };
};
