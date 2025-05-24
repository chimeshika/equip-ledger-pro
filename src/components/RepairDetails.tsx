
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Search, FileText, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEquipmentBySerial } from "@/hooks/useEquipment";
import { useRepairs } from "@/hooks/useRepairs";

const RepairDetails = () => {
  const { toast } = useToast();
  const [searchSerial, setSearchSerial] = useState("");
  const [shouldSearch, setShouldSearch] = useState(false);
  const [repairData, setRepairData] = useState({
    repair_date: "",
    repair_cost: "",
    description: "",
    notes: ""
  });
  const [repairBill, setRepairBill] = useState<File | null>(null);

  const { data: selectedEquipment, isLoading: isSearching } = useEquipmentBySerial(
    shouldSearch ? searchSerial : ""
  );
  
  const { repairs, addRepair, isAdding } = useRepairs(selectedEquipment?.id);

  const handleSearch = () => {
    if (!searchSerial.trim()) {
      toast({
        title: "Search Error",
        description: "Please enter a serial number",
        variant: "destructive"
      });
      return;
    }

    setShouldSearch(true);
    
    // Reset search flag after a delay to allow for new searches
    setTimeout(() => setShouldSearch(false), 100);
  };

  const handleRepairSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEquipment) {
      toast({
        title: "Error",
        description: "No equipment selected for repair",
        variant: "destructive"
      });
      return;
    }

    const repairRecord = {
      equipment_id: selectedEquipment.id,
      repair_date: repairData.repair_date,
      repair_cost: parseFloat(repairData.repair_cost),
      description: repairData.description,
      notes: repairData.notes || null,
      bill_attachment_url: null, // TODO: Implement file upload
    };

    addRepair(repairRecord);

    // Reset form
    setRepairData({
      repair_date: "",
      repair_cost: "",
      description: "",
      notes: ""
    });
    setRepairBill(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setRepairBill(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Equipment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Equipment for Repair
          </CardTitle>
          <CardDescription>
            Enter the serial number to find equipment and manage repair records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="searchSerial">Serial Number</Label>
              <Input
                id="searchSerial"
                value={searchSerial}
                onChange={(e) => setSearchSerial(e.target.value)}
                placeholder="Enter serial number"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={isSearching}>
                <Search className="h-4 w-4 mr-2" />
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>
          
          {shouldSearch && !selectedEquipment && !isSearching && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">No equipment found with serial number: {searchSerial}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Equipment Details */}
      {selectedEquipment && (
        <Card>
          <CardHeader>
            <CardTitle>Equipment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-sm text-slate-500">Item Name</p>
                <p className="font-medium">{selectedEquipment.item_name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Brand</p>
                <p className="font-medium">{selectedEquipment.brand}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Category</p>
                <p className="font-medium">{selectedEquipment.category}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Assigned To</p>
                <p className="font-medium">{selectedEquipment.assigned_to || "Unassigned"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Condition</p>
                <Badge className="bg-blue-100 text-blue-800">{selectedEquipment.condition}</Badge>
              </div>
              <div>
                <p className="text-sm text-slate-500">Serial Number</p>
                <p className="font-medium">{selectedEquipment.serial_number}</p>
              </div>
            </div>

            {/* Repair History */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Repair History</h3>
              <div className="space-y-3">
                {repairs.length === 0 ? (
                  <p className="text-slate-500">No repair history available.</p>
                ) : (
                  repairs.map((repair) => (
                    <Card key={repair.id} className="border-l-4 border-l-orange-400">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{repair.description}</p>
                            <p className="text-sm text-slate-600">{repair.notes}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${repair.repair_cost}</p>
                            <p className="text-sm text-slate-500">{new Date(repair.repair_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {repair.bill_attachment_url && (
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            View Bill
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New Repair */}
      {selectedEquipment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Repair Record
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRepairSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="repair_date">Repair Date *</Label>
                  <Input
                    id="repair_date"
                    type="date"
                    value={repairData.repair_date}
                    onChange={(e) => setRepairData(prev => ({ ...prev, repair_date: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="repair_cost">Repair Cost ($) *</Label>
                  <Input
                    id="repair_cost"
                    type="number"
                    step="0.01"
                    value={repairData.repair_cost}
                    onChange={(e) => setRepairData(prev => ({ ...prev, repair_cost: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Repair Description *</Label>
                <Input
                  id="description"
                  value={repairData.description}
                  onChange={(e) => setRepairData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the repair"
                  required
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={repairData.notes}
                  onChange={(e) => setRepairData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional details about the repair..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="repairBill">Repair Bill Document</Label>
                <Input
                  id="repairBill"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <p className="text-sm text-slate-500 mt-1">
                  Upload receipt or invoice for this repair
                </p>
              </div>

              <Button type="submit" disabled={isAdding}>
                <Plus className="h-4 w-4 mr-2" />
                {isAdding ? "Adding Repair..." : "Add Repair Record"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RepairDetails;
