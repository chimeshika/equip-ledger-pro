
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Repair {
  id: string;
  equipment_id: string;
  repair_date: string;
  repair_cost: number;
  description: string;
  notes?: string;
  bill_attachment_url?: string;
  created_at: string;
  updated_at: string;
}

export const useRepairs = (equipmentId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: repairs = [], isLoading } = useQuery({
    queryKey: ['repairs', equipmentId],
    queryFn: async () => {
      if (!user || !equipmentId) return [];

      const { data, error } = await supabase
        .from('repairs')
        .select('*')
        .eq('equipment_id', equipmentId)
        .order('repair_date', { ascending: false });

      if (error) {
        console.error('Error fetching repairs:', error);
        throw error;
      }

      return data as Repair[];
    },
    enabled: !!user && !!equipmentId,
  });

  const addRepairMutation = useMutation({
    mutationFn: async (repairData: Omit<Repair, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('repairs')
        .insert([repairData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repairs'] });
      toast({
        title: "Repair Record Added",
        description: "Repair details have been successfully saved.",
      });
    },
    onError: (error) => {
      console.error('Error adding repair:', error);
      toast({
        title: "Error",
        description: "Failed to add repair record. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    repairs,
    isLoading,
    addRepair: addRepairMutation.mutate,
    isAdding: addRepairMutation.isPending,
  };
};
