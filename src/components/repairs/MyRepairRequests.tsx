 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { useRepairRequests } from '@/hooks/useRepairRequests';
 import { FileText, Clock, CheckCircle, XCircle, Loader2, AlertTriangle, Wrench, RefreshCw, Replace, Calendar, Cog } from 'lucide-react';
 import { format } from 'date-fns';
 
 const requestTypeConfig = {
   damage: { icon: AlertTriangle, label: 'Damage', className: 'badge-gov-danger' },
   malfunction: { icon: RefreshCw, label: 'Malfunction', className: 'badge-gov-warning' },
   repair: { icon: Wrench, label: 'Repair', className: 'badge-gov-info' },
   replacement: { icon: Replace, label: 'Replacement', className: 'badge-gov-gold' },
 };
 
 const statusConfig = {
   pending: { icon: Clock, label: 'Pending Approval', className: 'badge-gov-warning', description: 'Waiting for branch head review' },
   approved: { icon: CheckCircle, label: 'Approved', className: 'badge-gov-success', description: 'Forwarded to IT Unit' },
   rejected: { icon: XCircle, label: 'Rejected', className: 'badge-gov-danger', description: 'Request was rejected' },
   in_progress: { icon: Cog, label: 'In Progress', className: 'badge-gov-info', description: 'Being handled by IT Unit' },
   completed: { icon: CheckCircle, label: 'Completed', className: 'badge-gov-success', description: 'Work completed' },
   cancelled: { icon: XCircle, label: 'Cancelled', className: 'badge-solid-secondary', description: 'Request cancelled' },
 };
 
 const jobStatusConfig = {
   received: { label: 'Received', description: 'IT Unit has received the equipment' },
   diagnosing: { label: 'Diagnosing', description: 'Checking the issue' },
   repairing: { label: 'Repairing', description: 'Repair work in progress' },
   waiting_parts: { label: 'Waiting for Parts', description: 'Waiting for spare parts' },
   completed: { label: 'Repair Complete', description: 'Repair work finished' },
   replaced: { label: 'Replaced', description: 'Equipment has been replaced' },
 };
 
 export function MyRepairRequests() {
   const { requests, isLoading } = useRepairRequests('my');
 
   if (isLoading) {
     return (
       <div className="flex items-center justify-center py-12">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
     );
   }
 
   return (
     <div className="space-y-6">
       <Card className="gov-card-elevated">
         <CardHeader className="border-b border-border pb-4">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg bg-gov-maroon flex items-center justify-center">
               <FileText className="h-5 w-5 text-white" />
             </div>
             <div>
               <CardTitle className="text-lg font-semibold text-foreground">My Repair Requests</CardTitle>
               <CardDescription>Track the status of your submitted requests</CardDescription>
             </div>
           </div>
         </CardHeader>
         <CardContent className="pt-4">
           <div className="flex gap-4 text-sm">
             <span className="text-muted-foreground">
               Total: <span className="font-semibold text-foreground">{requests.length}</span>
             </span>
             <span className="text-muted-foreground">
               Pending: <span className="font-semibold text-foreground">{requests.filter(r => r.status === 'pending').length}</span>
             </span>
             <span className="text-muted-foreground">
               In Progress: <span className="font-semibold text-foreground">{requests.filter(r => r.status === 'in_progress').length}</span>
             </span>
           </div>
         </CardContent>
       </Card>
 
       {requests.length === 0 ? (
         <Card className="gov-card">
           <CardContent className="py-12 text-center">
             <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
             <p className="text-muted-foreground font-medium">No requests yet</p>
             <p className="text-sm text-muted-foreground mt-1">Submit a repair request to get started</p>
           </CardContent>
         </Card>
       ) : (
         <div className="space-y-4">
           {requests.map((request) => {
             const typeConfig = requestTypeConfig[request.request_type];
             const status = statusConfig[request.status];
             const TypeIcon = typeConfig.icon;
             const StatusIcon = status.icon;
 
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
                         <Badge className={status.className}>
                           <StatusIcon className="h-3 w-3 mr-1" />
                           {status.label}
                         </Badge>
                         {request.job_status && (
                           <Badge variant="outline" className="text-xs">
                             <Cog className="h-3 w-3 mr-1" />
                             {jobStatusConfig[request.job_status]?.label}
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
 
                       {/* Branch Head Notes (if rejected) */}
                       {request.status === 'rejected' && request.branch_head_notes && (
                         <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                           <p className="text-xs font-medium text-destructive mb-1">Rejection Reason:</p>
                           <p className="text-sm text-foreground/80">{request.branch_head_notes}</p>
                         </div>
                       )}
 
                       {/* IT Notes (if any) */}
                       {request.repair_notes && (
                         <div className="p-3 bg-gov-info/10 border border-gov-info/30 rounded-lg">
                           <p className="text-xs font-medium text-gov-info mb-1">IT Notes:</p>
                           <p className="text-sm text-foreground/80">{request.repair_notes}</p>
                         </div>
                       )}
 
                       {/* Meta Info */}
                       <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                         <Calendar className="h-3.5 w-3.5" />
                         <span>Submitted: {format(new Date(request.created_at), 'MMM d, yyyy h:mm a')}</span>
                       </div>
                     </div>
 
                     {/* Status Timeline */}
                     <div className="hidden md:block w-48 p-4 bg-muted/30 rounded-lg">
                       <p className="text-xs font-medium text-muted-foreground mb-2">Status</p>
                       <div className="flex items-center gap-2">
                         <StatusIcon className={`h-5 w-5 ${
                           request.status === 'completed' ? 'text-gov-success' :
                           request.status === 'rejected' ? 'text-destructive' :
                           'text-gov-warning'
                         }`} />
                         <div>
                           <p className="text-sm font-medium">{status.label}</p>
                           <p className="text-xs text-muted-foreground">{status.description}</p>
                         </div>
                       </div>
                       {request.repair_cost && (
                         <div className="mt-3 pt-3 border-t border-border">
                           <p className="text-xs text-muted-foreground">Repair Cost</p>
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
     </div>
   );
 }