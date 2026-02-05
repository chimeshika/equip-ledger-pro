 import { useState } from 'react';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Input } from '@/components/ui/input';
 import { Textarea } from '@/components/ui/textarea';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
 import { useRepairRequests, RepairRequest, JobStatus } from '@/hooks/useRepairRequests';
 import { Wrench, Package, Loader2, AlertTriangle, RefreshCw, Replace, Calendar, Building2, User, Cog, CheckCircle } from 'lucide-react';
 import { format } from 'date-fns';
 
 const requestTypeConfig = {
   damage: { icon: AlertTriangle, label: 'Damage', className: 'badge-gov-danger' },
   malfunction: { icon: RefreshCw, label: 'Malfunction', className: 'badge-gov-warning' },
   repair: { icon: Wrench, label: 'Repair', className: 'badge-gov-info' },
   replacement: { icon: Replace, label: 'Replacement', className: 'badge-gov-gold' },
 };
 
 const jobStatusOptions: { value: JobStatus; label: string; description: string }[] = [
   { value: 'received', label: 'Received', description: 'Equipment received at IT Unit' },
   { value: 'diagnosing', label: 'Diagnosing', description: 'Checking the issue' },
   { value: 'repairing', label: 'Repairing', description: 'Repair work in progress' },
   { value: 'waiting_parts', label: 'Waiting for Parts', description: 'Waiting for spare parts' },
   { value: 'completed', label: 'Completed', description: 'Repair work finished' },
   { value: 'replaced', label: 'Replaced', description: 'Equipment replaced' },
 ];
 
 export function ITUnitQueue() {
   const { requests, isLoading, updateJobStatus, isUpdatingJob } = useRepairRequests('approved');
   const [selectedRequest, setSelectedRequest] = useState<RepairRequest | null>(null);
   const [jobStatus, setJobStatus] = useState<JobStatus>('received');
   const [repairCost, setRepairCost] = useState('');
   const [repairNotes, setRepairNotes] = useState('');
   const [decision, setDecision] = useState<'repair' | 'replace' | ''>('');
 
   const activeJobs = requests.filter(r => r.status === 'approved' || r.status === 'in_progress');
   const completedJobs = requests.filter(r => r.status === 'completed');
 
   const handleUpdateStatus = () => {
     if (!selectedRequest) return;
 
     updateJobStatus({
       requestId: selectedRequest.id,
       jobStatus,
       repairCost: repairCost ? parseFloat(repairCost) : undefined,
       repairNotes: repairNotes.trim() || undefined,
       decision: decision || undefined,
     }, {
       onSuccess: () => {
         setSelectedRequest(null);
         resetForm();
       },
     });
   };
 
   const openUpdateDialog = (request: RepairRequest) => {
     setSelectedRequest(request);
     setJobStatus(request.job_status || 'received');
     setRepairCost(request.repair_cost?.toString() || '');
     setRepairNotes(request.repair_notes || '');
     setDecision(request.decision || '');
   };
 
   const resetForm = () => {
     setJobStatus('received');
     setRepairCost('');
     setRepairNotes('');
     setDecision('');
   };
 
   if (isLoading) {
     return (
       <div className="flex items-center justify-center py-12">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
     );
   }
 
   return (
     <div className="space-y-6">
       {/* Header */}
       <Card className="gov-card-elevated">
         <CardHeader className="border-b border-border pb-4">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg bg-gov-info flex items-center justify-center">
               <Wrench className="h-5 w-5 text-white" />
             </div>
             <div>
               <CardTitle className="text-lg font-semibold text-foreground">IT Unit Job Queue</CardTitle>
               <CardDescription>Manage approved repair requests</CardDescription>
             </div>
           </div>
         </CardHeader>
         <CardContent className="pt-4">
           <div className="flex gap-4">
             <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gov-info/10 border border-gov-info/30">
               <Cog className="h-4 w-4 text-gov-info" />
               <span className="text-sm font-medium">{activeJobs.length} Active Jobs</span>
             </div>
             <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gov-success/10 border border-gov-success/30">
               <CheckCircle className="h-4 w-4 text-gov-success" />
               <span className="text-sm font-medium">{completedJobs.length} Completed</span>
             </div>
           </div>
         </CardContent>
       </Card>
 
       {/* Active Jobs */}
       {activeJobs.length === 0 ? (
         <Card className="gov-card">
           <CardContent className="py-12 text-center">
             <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
             <p className="text-muted-foreground font-medium">No pending jobs</p>
             <p className="text-sm text-muted-foreground mt-1">All approved requests have been processed</p>
           </CardContent>
         </Card>
       ) : (
         <div className="grid gap-4">
           {activeJobs.map((request) => {
             const typeConfig = requestTypeConfig[request.request_type];
             const TypeIcon = typeConfig.icon;
             const currentStatus = jobStatusOptions.find(s => s.value === request.job_status);
 
             return (
               <Card key={request.id} className="gov-card hover-lift">
                 <CardContent className="p-6">
                   <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                     <div className="flex-1 space-y-3">
                       {/* Badges */}
                       <div className="flex flex-wrap items-center gap-2">
                         <Badge className={typeConfig.className}>
                           <TypeIcon className="h-3 w-3 mr-1" />
                           {typeConfig.label}
                         </Badge>
                         {request.job_status && (
                           <Badge variant="outline" className="gap-1">
                             <Cog className="h-3 w-3" />
                             {currentStatus?.label}
                           </Badge>
                         )}
                         {request.decision && (
                           <Badge className={request.decision === 'repair' ? 'badge-gov-info' : 'badge-gov-gold'}>
                             {request.decision === 'repair' ? 'Repair' : 'Replace'}
                           </Badge>
                         )}
                       </div>
 
                       {/* Equipment Info */}
                       <div>
                         <h4 className="font-semibold text-foreground">
                           {request.equipment?.item_name || 'Unknown Equipment'}
                         </h4>
                         <p className="text-sm text-muted-foreground">
                           S/N: {request.equipment?.serial_number} • {request.equipment?.brand}
                         </p>
                       </div>
 
                       {/* Description */}
                       <p className="text-sm text-foreground/80 bg-muted/50 p-3 rounded-lg">
                         {request.description}
                       </p>
 
                       {/* Branch Head Notes */}
                       {request.branch_head_notes && (
                         <div className="p-3 bg-gov-navy/5 border border-gov-navy/20 rounded-lg">
                           <p className="text-xs font-medium text-gov-navy mb-1">Branch Head Notes:</p>
                           <p className="text-sm text-foreground/80">{request.branch_head_notes}</p>
                         </div>
                       )}
 
                       {/* Meta Info */}
                       <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                         <div className="flex items-center gap-1.5">
                           <User className="h-3.5 w-3.5" />
                           <span>{request.requester?.full_name || request.requester?.email}</span>
                         </div>
                         <div className="flex items-center gap-1.5">
                           <Building2 className="h-3.5 w-3.5" />
                           <span>{request.branch?.name}</span>
                         </div>
                         <div className="flex items-center gap-1.5">
                           <Calendar className="h-3.5 w-3.5" />
                           <span>Approved: {request.approved_at ? format(new Date(request.approved_at), 'MMM d, yyyy') : 'N/A'}</span>
                         </div>
                       </div>
                     </div>
 
                     {/* Action Button */}
                     <div className="flex flex-col gap-2">
                       <Button
                         onClick={() => openUpdateDialog(request)}
                         className="gap-2 btn-gov-secondary"
                       >
                         <Cog className="h-4 w-4" />
                         Update Status
                       </Button>
                       {request.repair_cost && (
                         <div className="text-center p-2 bg-muted/50 rounded-lg">
                           <p className="text-xs text-muted-foreground">Cost</p>
                           <p className="text-sm font-semibold">Rs. {request.repair_cost.toLocaleString()}</p>
                         </div>
                       )}
                     </div>
                   </div>
                 </CardContent>
               </Card>
             );
           })}
         </div>
       )}
 
       {/* Update Status Dialog */}
       <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
         <DialogContent className="sm:max-w-lg">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               <Cog className="h-5 w-5 text-primary" />
               Update Job Status
             </DialogTitle>
             <DialogDescription>
               Update the repair job status and add notes.
             </DialogDescription>
           </DialogHeader>
 
           <div className="space-y-4 py-4">
             {selectedRequest && (
               <div className="p-3 bg-muted/50 rounded-lg text-sm">
                 <p className="font-medium">{selectedRequest.equipment?.item_name}</p>
                 <p className="text-muted-foreground text-xs mt-1">
                   S/N: {selectedRequest.equipment?.serial_number}
                 </p>
               </div>
             )}
 
             {/* Job Status */}
             <div>
               <label className="text-sm font-medium mb-2 block">Job Status</label>
               <Select value={jobStatus} onValueChange={(v) => setJobStatus(v as JobStatus)}>
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   {jobStatusOptions.map((option) => (
                     <SelectItem key={option.value} value={option.value}>
                       <div>
                         <span className="font-medium">{option.label}</span>
                         <span className="text-muted-foreground ml-2 text-xs">- {option.description}</span>
                       </div>
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
 
             {/* Decision */}
             <div>
               <label className="text-sm font-medium mb-2 block">Decision</label>
               <Select value={decision} onValueChange={(v) => setDecision(v as 'repair' | 'replace')}>
                 <SelectTrigger>
                   <SelectValue placeholder="Select decision..." />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="repair">
                     <div className="flex items-center gap-2">
                       <Wrench className="h-4 w-4" />
                       <span>Repair</span>
                     </div>
                   </SelectItem>
                   <SelectItem value="replace">
                     <div className="flex items-center gap-2">
                       <Replace className="h-4 w-4" />
                       <span>Replace</span>
                     </div>
                   </SelectItem>
                 </SelectContent>
               </Select>
             </div>
 
             {/* Repair Cost */}
             <div>
               <label className="text-sm font-medium mb-2 block">Repair Cost (Rs.)</label>
               <Input
                 type="number"
                 placeholder="Enter repair cost..."
                 value={repairCost}
                 onChange={(e) => setRepairCost(e.target.value)}
               />
             </div>
 
             {/* Notes */}
             <div>
               <label className="text-sm font-medium mb-2 block">Notes</label>
               <Textarea
                 placeholder="Add repair notes or observations..."
                 value={repairNotes}
                 onChange={(e) => setRepairNotes(e.target.value)}
                 className="min-h-[100px]"
               />
             </div>
           </div>
 
           <DialogFooter className="gap-2">
             <Button variant="outline" onClick={() => setSelectedRequest(null)}>
               Cancel
             </Button>
             <Button
               onClick={handleUpdateStatus}
               disabled={isUpdatingJob}
               className="btn-gov-primary"
             >
               {isUpdatingJob ? (
                 <Loader2 className="h-4 w-4 animate-spin" />
               ) : (
                 'Update Status'
               )}
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     </div>
   );
 }