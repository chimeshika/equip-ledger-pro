import { useState, memo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Building2, Plus, Pencil, Trash2, Phone, MapPin } from "lucide-react";
import { useBranches, type Branch } from "@/hooks/useBranches";

interface BranchFormData {
  name: string;
  code: string;
  address: string;
  phone: string;
  is_active: boolean;
}

interface BranchFormProps {
  formData: BranchFormData;
  setFormData: React.Dispatch<React.SetStateAction<BranchFormData>>;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitLabel: string;
}

/**
 * Extracted as a stable, memoized component so it does NOT remount
 * on every parent re-render. This keeps the input DOM nodes alive,
 * preserving cursor position and avoiding the "jumpy input" bug.
 *
 * State is lifted to the parent and passed via props — the component
 * itself is a controlled form with no formatting on keystroke.
 * Any trimming / uppercasing should happen in the onSubmit handler.
 */
const BranchForm = memo(({ formData, setFormData, onSubmit, isSubmitting, submitLabel }: BranchFormProps) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="branch-name">Branch Name *</Label>
        <Input
          id="branch-name"
          value={formData.name}
          onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
          placeholder="e.g. Head Office"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="branch-code">Branch Code *</Label>
        <Input
          id="branch-code"
          value={formData.code}
          onChange={(e) => setFormData(p => ({ ...p, code: e.target.value }))}
          placeholder="e.g. HQ"
        />
      </div>
    </div>
    <div className="space-y-2">
      <Label htmlFor="branch-address">Address</Label>
      <Input
        id="branch-address"
        value={formData.address}
        onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
        placeholder="Branch address"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="branch-phone">Phone</Label>
      <Input
        id="branch-phone"
        value={formData.phone}
        onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
        placeholder="Contact number"
      />
    </div>
    <div className="flex items-center gap-3">
      <Switch
        id="branch-active"
        checked={formData.is_active}
        onCheckedChange={(v) => setFormData(p => ({ ...p, is_active: v }))}
      />
      <Label htmlFor="branch-active">Active</Label>
    </div>
    <DialogFooter>
      <Button
        onClick={onSubmit}
        disabled={isSubmitting || !formData.name || !formData.code}
        className="btn-gov-primary"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </DialogFooter>
  </div>
));
BranchForm.displayName = "BranchForm";

const INITIAL_FORM: BranchFormData = { name: "", code: "", address: "", phone: "", is_active: true };

const BranchManagement = () => {
  const { branches, isLoading, addBranch, isAdding, updateBranch, isUpdating, deleteBranch, isDeleting } = useBranches();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<BranchFormData>(INITIAL_FORM);

  const resetForm = useCallback(() => setFormData(INITIAL_FORM), []);

  // Formatting (trim) happens only on submit, never on keystroke
  const handleCreate = useCallback(() => {
    if (!formData.name.trim() || !formData.code.trim()) return;
    addBranch(
      { name: formData.name.trim(), code: formData.code.trim(), address: formData.address.trim() || undefined, phone: formData.phone.trim() || undefined, is_active: formData.is_active },
      { onSuccess: () => { setIsCreateOpen(false); resetForm(); } }
    );
  }, [formData, addBranch, resetForm]);

  const handleUpdate = useCallback(() => {
    if (!editingBranch) return;
    updateBranch(
      { id: editingBranch.id, name: formData.name.trim(), code: formData.code.trim(), address: formData.address.trim() || undefined, phone: formData.phone.trim() || undefined, is_active: formData.is_active },
      { onSuccess: () => { setEditingBranch(null); resetForm(); } }
    );
  }, [editingBranch, formData, updateBranch, resetForm]);

  const openEdit = useCallback((branch: Branch) => {
    setFormData({ name: branch.name, code: branch.code, address: branch.address || "", phone: branch.phone || "", is_active: branch.is_active });
    setEditingBranch(branch);
  }, []);

  if (isLoading) {
    return <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 skeleton rounded" />)}</div>;
  }

  return (
    <Card className="gov-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Building2 className="h-5 w-5 text-primary" />
            Branch Management
          </CardTitle>
          <CardDescription>Create and manage organizational branches</CardDescription>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="btn-gov-primary gap-1.5">
              <Plus className="h-4 w-4" /> Add Branch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Branch</DialogTitle>
              <DialogDescription>Add a new branch to the organization.</DialogDescription>
            </DialogHeader>
            <BranchForm formData={formData} setFormData={setFormData} onSubmit={handleCreate} isSubmitting={isAdding} submitLabel="Create Branch" />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {branches.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No branches created yet</p>
            <p className="text-sm mt-1">Click "Add Branch" to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {branches.map((branch) => (
              <div key={branch.id} className="flex items-center justify-between p-4 border rounded-md bg-card hover:shadow-gov-md transition-shadow">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{branch.name}</span>
                    <Badge variant="outline" className="text-xs">{branch.code}</Badge>
                    {branch.is_active ? (
                      <span className="badge-gov-success">Active</span>
                    ) : (
                      <span className="badge-gov-danger">Inactive</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {branch.address && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{branch.address}</span>}
                    {branch.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{branch.phone}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog open={editingBranch?.id === branch.id} onOpenChange={(open) => { if (!open) { setEditingBranch(null); resetForm(); } }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => openEdit(branch)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Branch</DialogTitle>
                        <DialogDescription>Update branch information.</DialogDescription>
                      </DialogHeader>
                      <BranchForm formData={formData} setFormData={setFormData} onSubmit={handleUpdate} isSubmitting={isUpdating} submitLabel="Save Changes" />
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => deleteBranch(branch.id)} disabled={isDeleting}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BranchManagement;
