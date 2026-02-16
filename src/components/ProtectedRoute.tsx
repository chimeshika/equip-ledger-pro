
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useUserBranchAssignment } from '@/hooks/useBranches';
import { BranchSelectionForm } from '@/components/BranchSelectionForm';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { assignment, isLoading: assignmentLoading } = useUserBranchAssignment();

  // Check if user is admin (admins bypass branch assignment requirement)
  const { data: isAdmin, isLoading: adminLoading } = useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      return !!data;
    },
    enabled: !!user,
  });

  if (loading || assignmentLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Admins don't need branch assignment
  if (isAdmin) {
    return <>{children}</>;
  }

  // If no assignment or rejected, show branch selection form
  if (!assignment || assignment.status === 'rejected') {
    return <BranchSelectionForm />;
  }

  // If pending, show branch selection form (it handles the pending state)
  if (assignment.status === 'pending') {
    return <BranchSelectionForm />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
