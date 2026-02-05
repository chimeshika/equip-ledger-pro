import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type RequestType = 'damage' | 'malfunction' | 'repair' | 'replacement';
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
export type JobStatus = 'received' | 'diagnosing' | 'repairing' | 'waiting_parts' | 'completed' | 'replaced';

export interface RepairRequest {
  id: string;
  equipment_id: string;
  requested_by: string;
  branch_id: string;
  request_type: RequestType;
  description: string;
  status: RequestStatus;
  branch_head_decision?: RequestStatus;
  branch_head_notes?: string;
  approved_by?: string;
  approved_at?: string;
  job_status?: JobStatus;
  it_assigned_to?: string;
  it_received_at?: string;
  repair_cost?: number;
  repair_notes?: string;
  decision?: 'repair' | 'replace';
  completed_at?: string;
  replacement_equipment_id?: string;
  created_at: string;
  updated_at: string;
  equipment?: {
    id: string;
    item_name: string;
    serial_number: string;
    brand: string;
  };
  requester?: {
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

export const useRepairRequests = (filter?: 'my' | 'branch' | 'approved' | 'all') => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['repairRequests', filter],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('repair_requests')
        .select(`
          *,
          branch:branches(id, name, code)
        `)
        .order('created_at', { ascending: false });

      if (filter === 'my') {
        query = query.eq('requested_by', user.id);
      } else if (filter === 'approved') {
        query = query.in('status', ['approved', 'in_progress', 'completed']);
      }

      const { data: requestsData, error } = await query;

      if (error) {
        console.error('Error fetching repair requests:', error);
        throw error;
      }

      if (!requestsData || requestsData.length === 0) return [];

      // Fetch equipment and requester profiles separately
      const equipmentIds = [...new Set(requestsData.map(r => r.equipment_id))];
      const requesterIds = [...new Set(requestsData.map(r => r.requested_by))];

      const [equipmentResult, profilesResult] = await Promise.all([
        supabase
          .from('equipment')
          .select('id, item_name, serial_number, brand')
          .in('id', equipmentIds),
        supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', requesterIds)
      ]);

      const equipmentMap = new Map(equipmentResult.data?.map(e => [e.id, e]) || []);
      const profilesMap = new Map(profilesResult.data?.map(p => [p.id, p]) || []);

      return requestsData.map(request => ({
        ...request,
        equipment: equipmentMap.get(request.equipment_id),
        requester: profilesMap.get(request.requested_by)
      })) as RepairRequest[];
    },
    enabled: !!user,
  });

  const createRequestMutation = useMutation({
    mutationFn: async (requestData: {
      equipment_id: string;
      branch_id: string;
      request_type: RequestType;
      description: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('repair_requests')
        .insert([{
          ...requestData,
          requested_by: user.id,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repairRequests'] });
      toast({
        title: "Request Submitted",
        description: "Your repair request has been submitted for approval.",
      });
    },
    onError: (error: any) => {
      console.error('Error creating repair request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit request.",
        variant: "destructive",
      });
    },
  });

  // Branch head approval/rejection
  const branchHeadDecisionMutation = useMutation({
    mutationFn: async ({ 
      requestId, 
      decision, 
      notes 
    }: { 
      requestId: string; 
      decision: 'approved' | 'rejected'; 
      notes?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('repair_requests')
        .update({
          status: decision,
          branch_head_decision: decision,
          branch_head_notes: notes,
          approved_by: user.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['repairRequests'] });
      toast({
        title: variables.decision === 'approved' ? "Request Approved" : "Request Rejected",
        description: variables.decision === 'approved' 
          ? "Request has been forwarded to IT Unit." 
          : "Request has been rejected.",
      });
    },
    onError: (error: any) => {
      console.error('Error processing decision:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process decision.",
        variant: "destructive",
      });
    },
  });

  // IT Unit job handling
  const updateJobStatusMutation = useMutation({
    mutationFn: async ({ 
      requestId, 
      jobStatus,
      repairCost,
      repairNotes,
      decision
    }: { 
      requestId: string; 
      jobStatus: JobStatus;
      repairCost?: number;
      repairNotes?: string;
      decision?: 'repair' | 'replace';
    }) => {
      if (!user) throw new Error('User not authenticated');

      const updateData: any = {
        job_status: jobStatus,
        it_assigned_to: user.id,
      };

      if (jobStatus === 'received' && !updateData.it_received_at) {
        updateData.it_received_at = new Date().toISOString();
        updateData.status = 'in_progress';
      }

      if (repairCost !== undefined) updateData.repair_cost = repairCost;
      if (repairNotes) updateData.repair_notes = repairNotes;
      if (decision) updateData.decision = decision;

      if (jobStatus === 'completed' || jobStatus === 'replaced') {
        updateData.completed_at = new Date().toISOString();
        updateData.status = 'completed';
      }

      const { data, error } = await supabase
        .from('repair_requests')
        .update(updateData)
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repairRequests'] });
      toast({
        title: "Job Updated",
        description: "Job status has been updated.",
      });
    },
    onError: (error: any) => {
      console.error('Error updating job status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update job status.",
        variant: "destructive",
      });
    },
  });

  return {
    requests,
    isLoading,
    createRequest: createRequestMutation.mutate,
    isCreating: createRequestMutation.isPending,
    branchHeadDecision: branchHeadDecisionMutation.mutate,
    isDeciding: branchHeadDecisionMutation.isPending,
    updateJobStatus: updateJobStatusMutation.mutate,
    isUpdatingJob: updateJobStatusMutation.isPending,
  };
};
