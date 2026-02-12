
import { Card, CardContent } from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/useProfiles";
import UserManagement from "./admin/UserManagement";
import EquipmentManagement from "./admin/EquipmentManagement";
import BranchManagement from "./admin/BranchManagement";
import BranchAssignmentApproval from "./admin/BranchAssignmentApproval";

const AdminPortal = () => {
  const { data: currentUser } = useCurrentUser();

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="p-6">
          <CardContent className="text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Access Denied</h3>
            <p className="text-slate-600">You need administrator privileges to access this portal.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BranchManagement />
      <BranchAssignmentApproval />
      <UserManagement />
      <EquipmentManagement />
    </div>
  );
};

export default AdminPortal;
