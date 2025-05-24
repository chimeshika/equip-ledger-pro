
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Equipment {
  id: string;
  item_name: string;
  category: string;
  brand: string;
  serial_number: string;
  purchase_date?: string;
  supplier?: string;
  price?: number;
  warranty_period?: string;
  warranty_expiry?: string;
  location?: string;
  assigned_to?: string;
  condition: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useEquipment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching equipment:', error);
        throw error;
      }

      return data as Equipment[];
    },
    enabled: !!user,
  });

  const addEquipmentMutation = useMutation({
    mutationFn: async (equipmentData: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('equipment')
        .insert([{ ...equipmentData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast({
        title: "Equipment Added",
        description: "Equipment has been successfully registered.",
      });
    },
    onError: (error) => {
      console.error('Error adding equipment:', error);
      toast({
        title: "Error",
        description: "Failed to add equipment. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    equipment,
    isLoading,
    addEquipment: addEquipmentMutation.mutate,
    isAdding: addEquipmentMutation.isPending,
  };
};

export const useEquipmentBySerial = (serialNumber: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['equipment', 'serial', serialNumber],
    queryFn: async () => {
      if (!user || !serialNumber) return null;

      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('serial_number', serialNumber)
        .maybeSingle();

      if (error) {
        console.error('Error fetching equipment by serial:', error);
        throw error;
      }

      return data as Equipment | null;
    },
    enabled: !!user && !!serialNumber,
  });
};
