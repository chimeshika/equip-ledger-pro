import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import jsPDF from "jspdf";

const ComputerRegisterReport = () => {
  const { toast } = useToast();
  const [selectedEquipment, setSelectedEquipment] = useState<string>("");

  const { data: equipmentList } = useQuery({
    queryKey: ["computer-register-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment")
        .select("id, item_name, serial_number, category")
        .eq("category", "Computer")
        .order("item_name");

      if (error) throw error;
      return data || [];
    },
  });

  const { data: equipmentDetails } = useQuery({
    queryKey: ["computer-register-details", selectedEquipment],
    queryFn: async () => {
      if (!selectedEquipment) return null;

      const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .eq("id", selectedEquipment)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!selectedEquipment,
  });

  const exportToPDF = () => {
    if (!equipmentDetails) {
      toast({ title: "Please select equipment first", variant: "destructive" });
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Register of Computers", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text("(Annexure 01)", doc.internal.pageSize.getWidth() - 20, 20, { align: "right" });
    
    let yPos = 35;
    doc.setFontSize(10);

    const addField = (label: string, value: string) => {
      doc.setFont(undefined, "bold");
      doc.text(label + ":", 20, yPos);
      doc.setFont(undefined, "normal");
      doc.text(value || "-", 80, yPos);
      yPos += 7;
    };

    addField("Item Name", equipmentDetails.item_name);
    addField("Brand", equipmentDetails.brand);
    addField("Serial Number", equipmentDetails.serial_number);
    addField("Category", equipmentDetails.category);
    addField("Purchase Date", equipmentDetails.purchase_date || "-");
    addField("Price", String(equipmentDetails.price || "-"));
    addField("Supplier", equipmentDetails.supplier || "-");
    addField("Condition", equipmentDetails.condition);
    addField("Location", equipmentDetails.location || "-");
    addField("Assigned To", equipmentDetails.assigned_to || "-");
    addField("Warranty Period", equipmentDetails.warranty_period || "-");
    addField("Warranty Expiry", equipmentDetails.warranty_expiry || "-");
    addField("Notes", equipmentDetails.notes || "-");

    doc.save(`computer-register-${equipmentDetails.serial_number}.pdf`);
    toast({ title: "PDF exported successfully" });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Register of Computers</CardTitle>
            <p className="text-sm text-muted-foreground">(Annexure 01)</p>
          </div>
          <Button onClick={exportToPDF} variant="outline" size="sm" disabled={!selectedEquipment}>
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Computer</label>
          <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a computer" />
            </SelectTrigger>
            <SelectContent>
              {equipmentList?.map((equipment) => (
                <SelectItem key={equipment.id} value={equipment.id}>
                  {equipment.item_name} - {equipment.serial_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {equipmentDetails && (
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg mb-4">Computer Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Item Name</p>
                <p className="font-medium">{equipmentDetails.item_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Brand</p>
                <p className="font-medium">{equipmentDetails.brand}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Serial Number</p>
                <p className="font-medium">{equipmentDetails.serial_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{equipmentDetails.category}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Purchase Date</p>
                <p className="font-medium">{equipmentDetails.purchase_date || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-medium">{equipmentDetails.price || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Supplier</p>
                <p className="font-medium">{equipmentDetails.supplier || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Condition</p>
                <p className="font-medium">{equipmentDetails.condition}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{equipmentDetails.location || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assigned To</p>
                <p className="font-medium">{equipmentDetails.assigned_to || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Warranty Period</p>
                <p className="font-medium">{equipmentDetails.warranty_period || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Warranty Expiry</p>
                <p className="font-medium">{equipmentDetails.warranty_expiry || "-"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="font-medium">{equipmentDetails.notes || "-"}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ComputerRegisterReport;
