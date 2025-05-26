
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import EquipmentSearch from "./EquipmentSearch";
import EquipmentDetails from "./EquipmentDetails";
import EditEquipmentDialog from "./EditEquipmentDialog";

const EquipmentManagement = () => {
  const { toast } = useToast();
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const [editingEquipment, setEditingEquipment] = useState<any>(null);
  const [searchSerial, setSearchSerial] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleEquipmentFound = (equipment: any) => {
    setSelectedEquipment(equipment);
  };

  const handleDeleteEquipment = async (equipmentId: string) => {
    try {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', equipmentId);

      if (error) throw error;

      toast({
        title: "Equipment Deleted",
        description: "Equipment has been successfully deleted.",
      });
      
      setSelectedEquipment(null);
    } catch (error) {
      console.error('Error deleting equipment:', error);
      toast({
        title: "Error",
        description: "Failed to delete equipment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateEquipment = async (updatedData: any) => {
    try {
      const { error } = await supabase
        .from('equipment')
        .update(updatedData)
        .eq('id', selectedEquipment.id);

      if (error) throw error;

      toast({
        title: "Equipment Updated",
        description: "Equipment has been successfully updated.",
      });
      
      setEditingEquipment(null);
      // Refresh the equipment data
      setSelectedEquipment({ ...selectedEquipment, ...updatedData });
    } catch (error) {
      console.error('Error updating equipment:', error);
      toast({
        title: "Error",
        description: "Failed to update equipment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Equipment Management
        </CardTitle>
        <CardDescription>
          Search, edit, or remove equipment from the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <EquipmentSearch 
          onEquipmentFound={handleEquipmentFound}
          isSearching={isSearching}
        />

        {selectedEquipment && (
          <EquipmentDetails
            equipment={selectedEquipment}
            onEdit={setEditingEquipment}
            onDelete={handleDeleteEquipment}
          />
        )}

        {editingEquipment && (
          <EditEquipmentDialog
            equipment={editingEquipment}
            onSave={handleUpdateEquipment}
            onClose={() => setEditingEquipment(null)}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default EquipmentManagement;
