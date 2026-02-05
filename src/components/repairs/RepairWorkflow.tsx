 import { useState } from 'react';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { RepairRequestForm } from './RepairRequestForm';
 import { MyRepairRequests } from './MyRepairRequests';
 import { BranchHeadApproval } from './BranchHeadApproval';
 import { ITUnitQueue } from './ITUnitQueue';
 import { useCurrentUser } from '@/hooks/useProfiles';
 import { PlusCircle, FileText, ClipboardCheck, Wrench } from 'lucide-react';
 
 export function RepairWorkflow() {
   const { data: currentUser } = useCurrentUser();
   const [activeTab, setActiveTab] = useState('new-request');
 
   const isBranchHead = currentUser?.role === 'branch_head' || currentUser?.role === 'admin';
   const isITUnit = currentUser?.role === 'it_unit' || currentUser?.role === 'admin';
 
   return (
     <div className="space-y-6">
       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
         <TabsList className="w-full justify-start gap-1 bg-muted/50 p-1 h-auto flex-wrap">
           <TabsTrigger 
             value="new-request" 
             className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
           >
             <PlusCircle className="h-4 w-4" />
             <span className="hidden sm:inline">New Request</span>
           </TabsTrigger>
           <TabsTrigger 
             value="my-requests" 
             className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
           >
             <FileText className="h-4 w-4" />
             <span className="hidden sm:inline">My Requests</span>
           </TabsTrigger>
           {isBranchHead && (
             <TabsTrigger 
               value="approvals" 
               className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
             >
               <ClipboardCheck className="h-4 w-4" />
               <span className="hidden sm:inline">Approvals</span>
             </TabsTrigger>
           )}
           {isITUnit && (
             <TabsTrigger 
               value="it-queue" 
               className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
             >
               <Wrench className="h-4 w-4" />
               <span className="hidden sm:inline">IT Queue</span>
             </TabsTrigger>
           )}
         </TabsList>
 
         <TabsContent value="new-request" className="mt-6">
           <RepairRequestForm />
         </TabsContent>
 
         <TabsContent value="my-requests" className="mt-6">
           <MyRepairRequests />
         </TabsContent>
 
         {isBranchHead && (
           <TabsContent value="approvals" className="mt-6">
             <BranchHeadApproval />
           </TabsContent>
         )}
 
         {isITUnit && (
           <TabsContent value="it-queue" className="mt-6">
             <ITUnitQueue />
           </TabsContent>
         )}
       </Tabs>
     </div>
   );
 }