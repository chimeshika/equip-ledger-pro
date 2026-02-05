import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface EquipmentAssignment {
  id: string;
  equipment_id: string;
  officer_id: string;
  branch_id: string;
  assigned_by?: string;
  assigned_at: string;
  unassigned_at?: string;
  is_active: boolean;
  notes?: string;
  equipment?: {
    id: string;
    item_name: string;
    serial_number: string;
    brand: string;
    category: string;
    condition: string;
  };
  officer?: {
    id: string;
    email: string;
    full_name?: string;
  };
  branch?: {
    id: string;
    name: string;
    code: string;
  };
}

export const useEquipmentAssignments = (filter?: 'my' | 'branch' | 'all') => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['equipmentAssignments', filter],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('equipment_assignments')
        .select(`
          *,
          equipment:equipment(id, item_name, serial_number, brand, category, condition),
          branch:branches(id, name, code)
        `)
        .eq('is_active', true)
        .order('assigned_at', { ascending: false });

      if (filter === 'my') {
        query = query.eq('officer_id', user.id);
      }

      const { data: assignmentsData, error } = await query;

      if (error) {
        console.error('Error fetching equipment assignments:', error);
        throw error;
      }

      if (!assignmentsData || assignmentsData.length === 0) return [];

      // Fetch officer profiles separately
      const officerIds = [...new Set(assignmentsData.map(a => a.officer_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', officerIds);

      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

      return assignmentsData.map(assignment => ({
        ...assignment,
        officer: profilesMap.get(assignment.officer_id)
      })) as EquipmentAssignment[];
    },
    enabled: !!user,
  });

  const assignEquipmentMutation = useMutation({
    mutationFn: async ({ 
      equipmentId, 
      officerId, 
      branchId,
      notes 
    }: { 
      equipmentId: string; 
      officerId: string; 
      branchId: string;
      notes?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // First, deactivate any existing active assignment for this equipment
      await supabase
        .from('equipment_assignments')
        .update({ 
          is_active: false, 
          unassigned_at: new Date().toISOString() 
        })
        .eq('equipment_id', equipmentId)
        .eq('is_active', true);

      // Create new assignment
      const { data, error } = await supabase
        .from('equipment_assignments')
        .insert([{
          equipment_id: equipmentId,
          officer_id: officerId,
          branch_id: branchId,
          assigned_by: user.id,
          notes,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipmentAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast({
        title: "Equipment Assigned",
        description: "Equipment has been assigned to the officer.",
      });
    },
    onError: (error: any) => {
      console.error('Error assigning equipment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign equipment.",
        variant: "destructive",
      });
    },
  });

  const unassignEquipmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('equipment_assignments')
        .update({ 
          is_active: false, 
          unassigned_at: new Date().toISOString() 
        })
        .eq('id', assignmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipmentAssignments'] });
      toast({
        title: "Equipment Unassigned",
        description: "Equipment has been unassigned from the officer.",
      });
    },
    onError: (error: any) => {
      console.error('Error unassigning equipment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to unassign equipment.",
        variant: "destructive",
      });
    },
  });

  return {
    assignments,
    isLoading,
    assignEquipment: assignEquipmentMutation.mutate,
    isAssigning: assignEquipmentMutation.isPending,
    unassignEquipment: unassignEquipmentMutation.mutate,
    isUnassigning: unassignEquipmentMutation.isPending,
  };
};

// Get assignments by officer
export const useOfficerEquipment = (officerId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['officerEquipment', officerId],
    queryFn: async () => {
      if (!user || !officerId) return [];

      const { data, error } = await supabase
        .from('equipment_assignments')
        .select(`
          *,
          equipment:equipment(*)
        `)
        .eq('officer_id', officerId)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching officer equipment:', error);
        throw error;
      }

      return data;
    },
    enabled: !!user && !!officerId,
  });
};
