import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  user_id?: string;
  branch_id?: string;
  created_at: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export const useAuditLogs = (filter?: {
  tableName?: string;
  recordId?: string;
  userId?: string;
  branchId?: string;
}) => {
  const { user } = useAuth();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['auditLogs', filter],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter?.tableName) {
        query = query.eq('table_name', filter.tableName);
      }
      if (filter?.recordId) {
        query = query.eq('record_id', filter.recordId);
      }
      if (filter?.userId) {
        query = query.eq('user_id', filter.userId);
      }
      if (filter?.branchId) {
        query = query.eq('branch_id', filter.branchId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching audit logs:', error);
        throw error;
      }

      return data as unknown as AuditLog[];
    },
    enabled: !!user,
  });

  return {
    logs,
    isLoading,
  };
};

// Get audit history for a specific equipment
export const useEquipmentAuditHistory = (equipmentId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['equipmentAuditHistory', equipmentId],
    queryFn: async () => {
      if (!user || !equipmentId) return [];

      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('table_name', 'equipment')
        .eq('record_id', equipmentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching equipment audit history:', error);
        throw error;
      }

      return data as unknown as AuditLog[];
    },
    enabled: !!user && !!equipmentId,
  });
};
