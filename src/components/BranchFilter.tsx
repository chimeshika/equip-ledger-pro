import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useBranches, useUserBranchAssignment } from "@/hooks/useBranches";
import { useCurrentUser } from "@/hooks/useProfiles";
import { hasGlobalAccess } from "@/lib/roles";

interface BranchFilterProps {
  value: string;
  onChange: (branchId: string) => void;
}

export function BranchFilter({ value, onChange }: BranchFilterProps) {
  const { branches } = useBranches();
  const { data: currentUser } = useCurrentUser();
  const { assignment } = useUserBranchAssignment();

  const canFilter = hasGlobalAccess(currentUser?.role);
  const userBranch = branches.find(b => b.id === assignment?.branch_id);

  if (!canFilter) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Building2 className="h-5 w-5" />
        <span className="text-sm font-medium">
          {userBranch ? `${userBranch.name} (${userBranch.code})` : 'No branch assigned'}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Building2 className="h-5 w-5" />
        <span className="text-sm font-medium">Branch:</span>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-[200px] h-9">
            <SelectValue placeholder="All Branches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {branches.filter(b => b.is_active).map(branch => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name} ({branch.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {value !== "all" && (
        <Badge variant="secondary" className="text-xs">Filtered</Badge>
      )}
    </div>
  );
}
