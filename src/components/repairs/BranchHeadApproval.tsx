 import { useState } from 'react';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Textarea } from '@/components/ui/textarea';
 import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
 import { useRepairRequests, RepairRequest } from '@/hooks/useRepairRequests';
 import { ClipboardCheck, CheckCircle, XCircle, Clock, AlertTriangle, Wrench, RefreshCw, Replace, Loader2, User, Calendar, Building2 } from 'lucide-react';
 import { format } from 'date-fns';
 
 const requestTypeConfig = {
   damage: { icon: AlertTriangle, label: 'Damage', className: 'badge-gov-danger' },
   malfunction: { icon: RefreshCw, label: 'Malfunction', className: 'badge-gov-warning' },
   repair: { icon: Wrench, label: 'Repair', className: 'badge-gov-info' },
   replacement: { icon: Replace, label: 'Replacement', className: 'badge-gov-gold' },
 };
 
 const statusConfig = {
   pending: { label: 'Pending', className: 'badge-gov-warning' },
   approved: { label: 'Approved', className: 'badge-gov-success' },
   rejected: { label: 'Rejected', className: 'badge-gov-danger' },
   in_progress: { label: 'In Progress', className: 'badge-gov-info' },
   completed: { label: 'Completed', className: 'badge-gov-success' },
   cancelled: { label: 'Cancelled', className: 'badge-solid-secondary' },
 };
 
 export function BranchHeadApproval() {
   const { requests, isLoading, branchHeadDecision, isDeciding } = useRepairRequests('branch');
   const [selectedRequest, setSelectedRequest] = useState<RepairRequest | null>(null);
   const [decisionType, setDecisionType] = useState<'approved' | 'rejected' | null>(null);
   const [notes, setNotes] = useState('');
 
   const pendingRequests = requests.filter(r => r.status === 'pending');
   const processedRequests = requests.filter(r => r.status !== 'pending');
 
   const handleDecision = () => {
     if (!selectedRequest || !decisionType) return;
     
     branchHeadDecision({
       requestId: selectedRequest.id,
       decision: decisionType,
       notes: notes.trim() || undefined,
     }, {
       onSuccess: () => {
         setSelectedRequest(null);
         setDecisionType(null);
         setNotes('');
       },
     });
   };
 
   const openDecisionDialog = (request: RepairRequest, decision: 'approved' | 'rejected') => {
     setSelectedRequest(request);
     setDecisionType(decision);
     setNotes('');
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
             <div className="w-10 h-10 rounded-lg bg-gov-navy flex items-center justify-center">
               <ClipboardCheck className="h-5 w-5 text-white" />
             </div>
             <div>
               <CardTitle className="text-lg font-semibold text-foreground">Pending Approvals</CardTitle>
               <CardDescription>Review and approve repair requests from your branch</CardDescription>
             </div>
           </div>
         </CardHeader>
         <CardContent className="pt-4">
           <div className="flex gap-4">
             <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gov-warning/10 border border-gov-warning/30">
               <Clock className="h-4 w-4 text-gov-warning" />
               <span className="text-sm font-medium">{pendingRequests.length} Pending</span>
             </div>
             <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gov-success/10 border border-gov-success/30">
               <CheckCircle className="h-4 w-4 text-gov-success" />
               <span className="text-sm font-medium">{processedRequests.filter(r => r.status === 'approved').length} Approved</span>
             </div>
           </div>
         </CardContent>
       </Card>
 
       {/* Pending Requests */}
       {pendingRequests.length === 0 ? (
         <Card className="gov-card">
           <CardContent className="py-12 text-center">
             <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
             <p className="text-muted-foreground font-medium">No pending requests</p>
             <p className="text-sm text-muted-foreground mt-1">All repair requests have been processed</p>
           </CardContent>
         </Card>
       ) : (
         <div className="grid gap-4">
           {pendingRequests.map((request) => {
             const typeConfig = requestTypeConfig[request.request_type];
             const TypeIcon = typeConfig.icon;
 
             return (
               <Card key={request.id} className="gov-card hover-lift">
                 <CardContent className="p-6">
                   <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                     <div className="flex-1 space-y-3">
                       {/* Type & Status Badges */}
                       <div className="flex flex-wrap items-center gap-2">
                         <Badge className={typeConfig.className}>
                           <TypeIcon className="h-3 w-3 mr-1" />
                           {typeConfig.label}
                         </Badge>
                         <Badge className={statusConfig[request.status].className}>
                           {statusConfig[request.status].label}
                         </Badge>
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
                           <span>{format(new Date(request.created_at), 'MMM d, yyyy h:mm a')}</span>
                         </div>
                       </div>
                     </div>
 
                     {/* Action Buttons */}
                     <div className="flex gap-2 md:flex-col">
                       <Button
                         onClick={() => openDecisionDialog(request, 'approved')}
                         className="flex-1 gap-2 bg-gov-success hover:bg-gov-success/90 text-white"
                       >
                         <CheckCircle className="h-4 w-4" />
                         Approve
                       </Button>
                       <Button
                         onClick={() => openDecisionDialog(request, 'rejected')}
                         variant="outline"
                         className="flex-1 gap-2 border-destructive text-destructive hover:bg-destructive/10"
                       >
                         <XCircle className="h-4 w-4" />
                         Reject
                       </Button>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             );
           })}
         </div>
       )}
 
       {/* Decision Dialog */}
       <Dialog open={!!selectedRequest && !!decisionType} onOpenChange={() => {
         setSelectedRequest(null);
         setDecisionType(null);
       }}>
         <DialogContent className="sm:max-w-md">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               {decisionType === 'approved' ? (
                 <CheckCircle className="h-5 w-5 text-gov-success" />
               ) : (
                 <XCircle className="h-5 w-5 text-destructive" />
               )}
               {decisionType === 'approved' ? 'Approve Request' : 'Reject Request'}
             </DialogTitle>
             <DialogDescription>
               {decisionType === 'approved'
                 ? 'This will forward the request to the IT Unit for processing.'
                 : 'Please provide a reason for rejecting this request.'}
             </DialogDescription>
           </DialogHeader>
 
           <div className="space-y-4 py-4">
             {selectedRequest && (
               <div className="p-3 bg-muted/50 rounded-lg text-sm">
                 <p className="font-medium">{selectedRequest.equipment?.item_name}</p>
                 <p className="text-muted-foreground text-xs mt-1">
                   Requested by: {selectedRequest.requester?.full_name || selectedRequest.requester?.email}
                 </p>
               </div>
             )}
 
             <div>
               <label className="text-sm font-medium mb-2 block">
                 Notes {decisionType === 'rejected' && <span className="text-destructive">*</span>}
               </label>
               <Textarea
                 placeholder={decisionType === 'approved' 
                   ? 'Optional notes for IT Unit...'
                   : 'Reason for rejection (required)...'}
                 value={notes}
                 onChange={(e) => setNotes(e.target.value)}
                 className="min-h-[100px]"
               />
             </div>
           </div>
 
           <DialogFooter className="gap-2">
             <Button
               variant="outline"
               onClick={() => {
                 setSelectedRequest(null);
                 setDecisionType(null);
               }}
             >
               Cancel
             </Button>
             <Button
               onClick={handleDecision}
               disabled={isDeciding || (decisionType === 'rejected' && !notes.trim())}
               className={decisionType === 'approved' 
                 ? 'bg-gov-success hover:bg-gov-success/90 text-white'
                 : 'bg-destructive hover:bg-destructive/90 text-white'}
             >
               {isDeciding ? (
                 <Loader2 className="h-4 w-4 animate-spin" />
               ) : (
                 <>
                   {decisionType === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
                 </>
               )}
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     </div>
   );
 }