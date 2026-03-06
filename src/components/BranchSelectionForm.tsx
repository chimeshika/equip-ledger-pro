
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { GovernmentHeader } from '@/components/GovernmentHeader';
import { GovernmentFooter } from '@/components/GovernmentFooter';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useBranches, useUserBranchAssignment, useApprovedUsers } from '@/hooks/useBranches';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Clock, XCircle, LogOut } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

const ROLE_OPTIONS: { value: AppRole; label: string }[] = [
  { value: 'officer', label: 'Officer' },
  { value: 'branch_head', label: 'Branch Head' },
  { value: 'it_unit', label: 'IT Unit' },
];

export const BranchSelectionForm = () => {
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('officer');
  const [designation, setDesignation] = useState('');
  const [postOrder, setPostOrder] = useState('');
  const [supervisorId, setSupervisorId] = useState('');
  const { branches, isLoading: branchesLoading } = useBranches();
  const { assignment, isLoading: assignmentLoading, requestAssignment, isRequesting } = useUserBranchAssignment();
  const { data: approvedUsers = [] } = useApprovedUsers();
  const { user, signOut } = useAuth();

  const activeBranches = branches.filter(b => b.is_active);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch) return;
    requestAssignment({
      branchId: selectedBranch,
      requestedRole: selectedRole,
      designation: designation.trim() || undefined,
      postOrder: postOrder ? parseInt(postOrder, 10) : undefined,
      supervisorId: supervisorId || undefined,
    });
  };

  const isPending = assignment?.status === 'pending';
  const isRejected = assignment?.status === 'rejected';

  // Filter out current user from supervisor list
  const supervisorOptions = approvedUsers.filter(u => u.id !== user?.id);

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <GovernmentHeader />
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <Card className="w-full max-w-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Branch Assignment
            </CardTitle>
            <CardDescription>
              Select your branch, enter your designation, and choose your reporting officer
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignmentLoading || branchesLoading ? (
              <div className="flex justify-center py-8">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : isPending ? (
              <div className="text-center space-y-4 py-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
                  <Clock className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Request Pending</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your branch assignment request is awaiting admin approval.
                  </p>
                </div>
                {assignment?.branch && (
                  <div className="bg-muted/50 rounded-md p-3 text-sm space-y-1 text-left">
                    <p><span className="font-medium">Branch:</span> {assignment.branch.name} ({assignment.branch.code})</p>
                    <p><span className="font-medium">Requested Role:</span> <Badge variant="outline">{assignment.requested_role}</Badge></p>
                    {(assignment as any).designation && (
                      <p><span className="font-medium">Designation:</span> {(assignment as any).designation}</p>
                    )}
                    {(assignment as any).post_order && (
                      <p><span className="font-medium">Post Order:</span> {(assignment as any).post_order}</p>
                    )}
                  </div>
                )}
                <Button variant="outline" onClick={signOut} className="mt-4 gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            ) : isRejected ? (
              <div className="space-y-4">
                <div className="text-center space-y-2 py-2">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                    <XCircle className="h-8 w-8 text-destructive" />
                  </div>
                  <h3 className="font-semibold text-foreground">Request Rejected</h3>
                  <p className="text-sm text-muted-foreground">
                    Your previous request was rejected. Please submit a new request.
                  </p>
                </div>
                <BranchRequestForm
                  activeBranches={activeBranches}
                  selectedBranch={selectedBranch}
                  setSelectedBranch={setSelectedBranch}
                  selectedRole={selectedRole}
                  setSelectedRole={setSelectedRole}
                  designation={designation}
                  setDesignation={setDesignation}
                  postOrder={postOrder}
                  setPostOrder={setPostOrder}
                  supervisorId={supervisorId}
                  setSupervisorId={setSupervisorId}
                  supervisorOptions={supervisorOptions}
                  onSubmit={handleSubmit}
                  isRequesting={isRequesting}
                />
                <div className="text-center">
                  <Button variant="ghost" onClick={signOut} className="gap-2 text-muted-foreground">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <BranchRequestForm
                  activeBranches={activeBranches}
                  selectedBranch={selectedBranch}
                  setSelectedBranch={setSelectedBranch}
                  selectedRole={selectedRole}
                  setSelectedRole={setSelectedRole}
                  designation={designation}
                  setDesignation={setDesignation}
                  postOrder={postOrder}
                  setPostOrder={setPostOrder}
                  supervisorId={supervisorId}
                  setSupervisorId={setSupervisorId}
                  supervisorOptions={supervisorOptions}
                  onSubmit={handleSubmit}
                  isRequesting={isRequesting}
                />
                <div className="text-center">
                  <Button variant="ghost" onClick={signOut} className="gap-2 text-muted-foreground">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <GovernmentFooter />
    </div>
  );
};

interface BranchRequestFormProps {
  activeBranches: { id: string; name: string; code: string }[];
  selectedBranch: string;
  setSelectedBranch: (val: string) => void;
  selectedRole: AppRole;
  setSelectedRole: (val: AppRole) => void;
  designation: string;
  setDesignation: (val: string) => void;
  postOrder: string;
  setPostOrder: (val: string) => void;
  supervisorId: string;
  setSupervisorId: (val: string) => void;
  supervisorOptions: { id: string; full_name: string | null; designation?: string | null }[];
  onSubmit: (e: React.FormEvent) => void;
  isRequesting: boolean;
}

const BranchRequestForm = ({
  activeBranches,
  selectedBranch,
  setSelectedBranch,
  selectedRole,
  setSelectedRole,
  designation,
  setDesignation,
  postOrder,
  setPostOrder,
  supervisorId,
  setSupervisorId,
  supervisorOptions,
  onSubmit,
  isRequesting,
}: BranchRequestFormProps) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="branch">Branch</Label>
      <Select value={selectedBranch} onValueChange={setSelectedBranch}>
        <SelectTrigger id="branch">
          <SelectValue placeholder="Select your branch" />
        </SelectTrigger>
        <SelectContent>
          {activeBranches.map((branch) => (
            <SelectItem key={branch.id} value={branch.id}>
              {branch.name} ({branch.code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label htmlFor="role">Requested Role</Label>
      <Select value={selectedRole} onValueChange={(val) => setSelectedRole(val as AppRole)}>
        <SelectTrigger id="role">
          <SelectValue placeholder="Select your role" />
        </SelectTrigger>
        <SelectContent>
          {ROLE_OPTIONS.map((role) => (
            <SelectItem key={role.value} value={role.value}>
              {role.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label htmlFor="designation">Designation</Label>
      <Input
        id="designation"
        placeholder="e.g. Senior Management Assistant"
        value={designation}
        onChange={(e) => setDesignation(e.target.value)}
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="postOrder">Post Order / Seniority Number</Label>
      <Input
        id="postOrder"
        type="number"
        placeholder="e.g. 1"
        min={1}
        value={postOrder}
        onChange={(e) => setPostOrder(e.target.value)}
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="supervisor">Select Your Reporting Officer / Supervisor</Label>
      <Select value={supervisorId} onValueChange={setSupervisorId}>
        <SelectTrigger id="supervisor">
          <SelectValue placeholder="Select your supervisor" />
        </SelectTrigger>
        <SelectContent>
          {supervisorOptions.map((u) => (
            <SelectItem key={u.id} value={u.id}>
              {u.full_name || 'Unnamed'}{u.designation ? ` — ${u.designation}` : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <Button type="submit" className="w-full" disabled={!selectedBranch || isRequesting}>
      {isRequesting ? 'Submitting Request...' : 'Request Branch Assignment'}
    </Button>
  </form>
);
