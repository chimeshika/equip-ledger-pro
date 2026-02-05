 import { useState } from 'react';
 import { useForm } from 'react-hook-form';
 import { zodResolver } from '@hookform/resolvers/zod';
 import { z } from 'zod';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
 import { Input } from '@/components/ui/input';
 import { Button } from '@/components/ui/button';
 import { Textarea } from '@/components/ui/textarea';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { useRepairRequests, RequestType } from '@/hooks/useRepairRequests';
 import { useEquipment } from '@/hooks/useEquipment';
 import { useBranches } from '@/hooks/useBranches';
 import { AlertTriangle, Wrench, RefreshCw, Replace, Send, Loader2 } from 'lucide-react';
 
 const requestSchema = z.object({
   equipment_id: z.string().min(1, 'Please select equipment'),
   branch_id: z.string().min(1, 'Please select a branch'),
   request_type: z.enum(['damage', 'malfunction', 'repair', 'replacement'] as const),
   description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must be less than 500 characters'),
 });
 
 type RequestFormData = z.infer<typeof requestSchema>;
 
 const requestTypeOptions: { value: RequestType; label: string; icon: typeof AlertTriangle; description: string }[] = [
   { value: 'damage', label: 'Damage Report', icon: AlertTriangle, description: 'Physical damage to equipment' },
   { value: 'malfunction', label: 'Malfunction', icon: RefreshCw, description: 'Equipment not working correctly' },
   { value: 'repair', label: 'Repair Request', icon: Wrench, description: 'Request maintenance or repair' },
   { value: 'replacement', label: 'Replacement', icon: Replace, description: 'Request equipment replacement' },
 ];
 
 export function RepairRequestForm() {
   const { createRequest, isCreating } = useRepairRequests();
   const { equipment, isLoading: equipmentLoading } = useEquipment();
   const { branches, isLoading: branchesLoading } = useBranches();
   const [submitted, setSubmitted] = useState(false);
 
   const form = useForm<RequestFormData>({
     resolver: zodResolver(requestSchema),
     defaultValues: {
       equipment_id: '',
       branch_id: '',
       request_type: 'repair',
       description: '',
     },
   });
 
   const onSubmit = (data: RequestFormData) => {
     createRequest({
       equipment_id: data.equipment_id,
       branch_id: data.branch_id,
       request_type: data.request_type,
       description: data.description,
     }, {
       onSuccess: () => {
         form.reset();
         setSubmitted(true);
         setTimeout(() => setSubmitted(false), 3000);
       },
     });
   };
 
   const selectedType = form.watch('request_type');
 
   return (
     <Card className="gov-card-elevated">
       <CardHeader className="border-b border-border pb-4">
         <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-lg bg-gov-maroon flex items-center justify-center">
             <Wrench className="h-5 w-5 text-white" />
           </div>
           <div>
             <CardTitle className="text-lg font-semibold text-foreground">Submit Repair Request</CardTitle>
             <CardDescription>Report equipment issues or request repairs</CardDescription>
           </div>
         </div>
       </CardHeader>
       <CardContent className="pt-6">
         {submitted && (
           <div className="mb-6 p-4 rounded-lg bg-gov-success/10 border border-gov-success/30">
             <p className="text-sm font-medium text-gov-success flex items-center gap-2">
               <span className="status-excellent" />
               Request submitted successfully! Awaiting branch head approval.
             </p>
           </div>
         )}
 
         <Form {...form}>
           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
             {/* Request Type Selection */}
             <FormField
               control={form.control}
               name="request_type"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel className="text-sm font-medium">Request Type</FormLabel>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                     {requestTypeOptions.map((option) => (
                       <button
                         key={option.value}
                         type="button"
                         onClick={() => field.onChange(option.value)}
                         className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                           field.value === option.value
                             ? 'border-primary bg-primary/5'
                             : 'border-border hover:border-primary/50'
                         }`}
                       >
                         <option.icon className={`h-5 w-5 mb-2 ${
                           field.value === option.value ? 'text-primary' : 'text-muted-foreground'
                         }`} />
                         <p className={`text-sm font-medium ${
                           field.value === option.value ? 'text-foreground' : 'text-muted-foreground'
                         }`}>
                           {option.label}
                         </p>
                         <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                       </button>
                     ))}
                   </div>
                   <FormMessage />
                 </FormItem>
               )}
             />
 
             <div className="grid md:grid-cols-2 gap-4">
               {/* Branch Selection */}
               <FormField
                 control={form.control}
                 name="branch_id"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel className="text-sm font-medium">Branch</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value}>
                       <FormControl>
                         <SelectTrigger className="h-11">
                           <SelectValue placeholder={branchesLoading ? "Loading..." : "Select branch"} />
                         </SelectTrigger>
                       </FormControl>
                       <SelectContent>
                         {branches.map((branch) => (
                           <SelectItem key={branch.id} value={branch.id}>
                             <span className="font-medium">{branch.code}</span>
                             <span className="text-muted-foreground ml-2">- {branch.name}</span>
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                     <FormMessage />
                   </FormItem>
                 )}
               />
 
               {/* Equipment Selection */}
               <FormField
                 control={form.control}
                 name="equipment_id"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel className="text-sm font-medium">Equipment</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value}>
                       <FormControl>
                         <SelectTrigger className="h-11">
                           <SelectValue placeholder={equipmentLoading ? "Loading..." : "Select equipment"} />
                         </SelectTrigger>
                       </FormControl>
                       <SelectContent>
                         {equipment.map((item) => (
                           <SelectItem key={item.id} value={item.id}>
                             <div className="flex flex-col">
                               <span className="font-medium">{item.item_name}</span>
                               <span className="text-xs text-muted-foreground">{item.serial_number}</span>
                             </div>
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                     <FormMessage />
                   </FormItem>
                 )}
               />
             </div>
 
             {/* Description */}
             <FormField
               control={form.control}
               name="description"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel className="text-sm font-medium">Description</FormLabel>
                   <FormControl>
                     <Textarea
                       placeholder="Describe the issue or request in detail..."
                       className="min-h-[120px] resize-none"
                       {...field}
                     />
                   </FormControl>
                   <p className="text-xs text-muted-foreground mt-1">
                     {field.value.length}/500 characters
                   </p>
                   <FormMessage />
                 </FormItem>
               )}
             />
 
             <div className="flex justify-end pt-4 border-t border-border">
               <Button
                 type="submit"
                 disabled={isCreating}
                 className="btn-gov-primary gap-2"
               >
                 {isCreating ? (
                   <>
                     <Loader2 className="h-4 w-4 animate-spin" />
                     Submitting...
                   </>
                 ) : (
                   <>
                     <Send className="h-4 w-4" />
                     Submit Request
                   </>
                 )}
               </Button>
             </div>
           </form>
         </Form>
       </CardContent>
     </Card>
   );
 }