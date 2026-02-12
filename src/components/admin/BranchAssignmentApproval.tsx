import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Check, X, Clock, Building2 } from "lucide-react";
import { useBranchAssignments } from "@/hooks/useBranches";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database['public']['Enums']['app_role'];

const roleLabels: Record<AppRole, string> = {
  admin: "Administrator",
  user: "User",
  branch_head: "Branch Head",
  it_unit: "IT Unit",
  officer: "Officer",
};

const statusStyles: Record<string, string> = {
  pending: "badge-gov-warning",
  approved: "badge-gov-success",
  rejected: "badge-gov-danger",
};

const BranchAssignmentApproval = () => {
  const { assignments, isLoading, approveAssignment, isApproving, rejectAssignment, isRejecting } = useBranchAssignments();

  const pending = assignments.filter(a => a.status === "pending");
  const processed = assignments.filter(a => a.status !== "pending");

  if (isLoading) {
    return <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 skeleton rounded" />)}</div>;
  }

  return (
    <Card className="gov-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <UserCheck className="h-5 w-5 text-primary" />
          User Assignment Approval
          {pending.length > 0 && (
            <Badge variant="destructive" className="ml-2">{pending.length}</Badge>
          )}
        </CardTitle>
        <CardDescription>Review and approve user branch assignment requests</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pending Requests */}
        {pending.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4" /> Pending Requests ({pending.length})
            </h3>
            {pending.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-md bg-card border-l-4 border-l-accent">
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">
                    {assignment.profile?.full_name || assignment.profile?.email || "Unknown User"}
                  </p>
                  <p className="text-sm text-muted-foreground">{assignment.profile?.email}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      {assignment.branch?.name || "Unknown Branch"}
                    </span>
                    <Badge variant="outline" className="text-xs">{roleLabels[assignment.requested_role]}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="btn-gov-primary gap-1.5"
                    onClick={() => approveAssignment({ assignmentId: assignment.id, userId: assignment.user_id, role: assignment.requested_role })}
                    disabled={isApproving}
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-destructive hover:bg-destructive/10"
                    onClick={() => rejectAssignment(assignment.id)}
                    disabled={isRejecting}
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Processed Requests */}
        {processed.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Processed Requests ({processed.length})
            </h3>
            {processed.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-md bg-muted/30">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    {assignment.profile?.full_name || assignment.profile?.email || "Unknown User"}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {assignment.branch?.name || "Unknown Branch"}
                    </span>
                    <Badge variant="outline" className="text-xs">{roleLabels[assignment.requested_role]}</Badge>
                  </div>
                </div>
                <span className={statusStyles[assignment.status] || "badge-gov-info"}>
                  {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        )}

        {assignments.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No assignment requests</p>
            <p className="text-sm mt-1">User requests will appear here when submitted.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BranchAssignmentApproval;
