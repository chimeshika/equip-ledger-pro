
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, FileText, Calendar, Save, X } from "lucide-react";
import { useEquipmentBySerial } from "@/hooks/useEquipment";
import { useRepairs } from "@/hooks/useRepairs";
import { useCurrentUser } from "@/hooks/useProfiles";
import { generateEquipmentPDF } from "@/utils/pdfGenerator";
import { supabase } from "@/integrations/supabase/client";
import EditEquipmentForm from "@/components/equipment/EditEquipmentForm";
import { GovernmentHeader } from "@/components/GovernmentHeader";
import { GovernmentFooter } from "@/components/GovernmentFooter";

const EquipmentDetails = () => {
  const { serialNumber } = useParams<{ serialNumber: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  const { data: equipment, refetch } = useEquipmentBySerial(serialNumber || "");
  const { repairs } = useRepairs(equipment?.id);
  const { data: currentUser } = useCurrentUser();

  const canEdit = equipment && currentUser && (
    currentUser.role === 'admin' || equipment.created_by === currentUser.id
  );

  const handleSaveEquipment = async (updatedData: any) => {
    if (!equipment) return;
    
    try {
      const { error } = await supabase
        .from('equipment')
        .update(updatedData)
        .eq('id', equipment.id);

      if (error) throw error;

      toast({
        title: "Equipment Updated",
        description: "Equipment details have been successfully updated.",
      });
      
      setIsEditing(false);
      refetch();
    } catch (error) {
      console.error('Error updating equipment:', error);
      toast({
        title: "Error",
        description: "Failed to update equipment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generatePDF = () => {
    if (!equipment) return;
    
    try {
      generateEquipmentPDF(equipment, repairs);
      toast({
        title: "PDF Generated",
        description: "Equipment report has been generated and downloaded",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!equipment) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <GovernmentHeader />
        <div className="flex-1 max-w-4xl mx-auto p-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Equipment not found</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
        <GovernmentFooter />
      </div>
    );
  }

  const totalRepairCost = repairs.reduce((sum, repair) => sum + repair.repair_cost, 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GovernmentHeader />
      <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="mb-4 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-slate-800">{equipment.item_name}</h1>
            <p className="text-slate-600">Serial: {equipment.serial_number}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={generatePDF} variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            {canEdit && !isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Equipment
              </Button>
            )}
            {isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Equipment Details */}
        {isEditing ? (
          <EditEquipmentForm 
            equipment={equipment}
            onSave={handleSaveEquipment}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Equipment Information</CardTitle>
              <CardDescription>Complete details and specifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800 border-b pb-2">Basic Information</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-slate-500">Brand/Model</p>
                      <p className="font-medium">{equipment.brand}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Condition</p>
                      <Badge className="bg-blue-100 text-blue-800">{equipment.condition}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Location</p>
                      <p className="font-medium">{equipment.location || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Assigned To</p>
                      <p className="font-medium">{equipment.assigned_to || "Unassigned"}</p>
                    </div>
                  </div>
                </div>

                {/* Purchase Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800 border-b pb-2">Purchase Information</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-slate-500">Purchase Date</p>
                      <p className="font-medium">
                        {equipment.purchase_date 
                          ? new Date(equipment.purchase_date).toLocaleDateString()
                          : "Not specified"
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Supplier</p>
                      <p className="font-medium">{equipment.supplier || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Price</p>
                      <p className="font-medium">
                        {equipment.price ? `$${equipment.price.toLocaleString()}` : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Warranty Period</p>
                      <p className="font-medium">{equipment.warranty_period || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800 border-b pb-2">Financial Summary</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-slate-500">Initial Cost</p>
                      <p className="font-medium">
                        {equipment.price ? `$${equipment.price.toLocaleString()}` : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Total Repair Cost</p>
                      <p className="font-medium text-orange-600">${totalRepairCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Total Investment</p>
                      <p className="font-medium text-slate-800">
                        ${((equipment.price || 0) + totalRepairCost).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {equipment.notes && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-slate-800 mb-2">Notes</h3>
                  <p className="text-slate-600">{equipment.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Repair History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Repair History
            </CardTitle>
            <CardDescription>Complete maintenance and repair records</CardDescription>
          </CardHeader>
          <CardContent>
            {repairs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-600">No repair history available.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {repairs.map((repair) => (
                  <Card key={repair.id} className="border-l-4 border-l-orange-400">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-800">{repair.description}</h4>
                          <p className="text-sm text-slate-600 mt-1">{repair.notes}</p>
                          <p className="text-sm text-slate-500 mt-2">
                            Date: {new Date(repair.repair_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">${repair.repair_cost.toFixed(2)}</p>
                          <Badge variant="outline" className="mt-1">
                            Repair #{repair.id.slice(0, 8)}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Summary */}
                <div className="mt-6 pt-6 border-t bg-slate-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-slate-800">{repairs.length}</p>
                      <p className="text-sm text-slate-600">Total Repairs</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">${totalRepairCost.toFixed(2)}</p>
                      <p className="text-sm text-slate-600">Total Repair Cost</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-800">
                        {repairs.length > 0 ? `$${(totalRepairCost / repairs.length).toFixed(2)}` : "$0.00"}
                      </p>
                      <p className="text-sm text-slate-600">Average Repair Cost</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
      <GovernmentFooter />
    </div>
  );
};

export default EquipmentDetails;
