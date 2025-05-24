
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Search, FileText, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const RepairDetails = () => {
  const { toast } = useToast();
  const [searchSerial, setSearchSerial] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const [repairData, setRepairData] = useState({
    repairDate: "",
    repairCost: "",
    description: "",
    notes: ""
  });
  const [repairBill, setRepairBill] = useState<File | null>(null);

  // Mock equipment data (in real app, this would come from Supabase)
  const mockEquipment = {
    itemName: "Dell Laptop XPS 13",
    serialNumber: "DL001234",
    brand: "Dell",
    category: "Computer",
    assignedTo: "John Smith",
    condition: "Good",
    repairHistory: [
      {
        id: 1,
        date: "2023-11-15",
        cost: 125.50,
        description: "Screen replacement",
        notes: "Cracked screen from drop",
        bill: "repair-bill-001.pdf"
      },
      {
        id: 2,
        date: "2023-08-20",
        cost: 75.00,
        description: "Battery replacement",
        notes: "Battery not holding charge",
        bill: "repair-bill-002.pdf"
      }
    ]
  };

  const handleSearch = () => {
    if (searchSerial === "DL001234") {
      setSelectedEquipment(mockEquipment);
      toast({
        title: "Equipment Found",
        description: `Found ${mockEquipment.itemName} with serial number ${searchSerial}`,
      });
    } else {
      setSelectedEquipment(null);
      toast({
        title: "Equipment Not Found",
        description: "No equipment found with that serial number",
        variant: "destructive"
      });
    }
  };

  const handleRepairSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would save repair data to Supabase
    console.log("Repair data:", repairData);
    console.log("Repair bill:", repairBill);
    
    toast({
      title: "Repair Record Added",
      description: "Repair details have been successfully saved.",
    });

    // Reset form
    setRepairData({
      repairDate: "",
      repairCost: "",
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
                placeholder="Enter serial number (try: DL001234)"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
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
                <p className="font-medium">{selectedEquipment.itemName}</p>
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
                <p className="font-medium">{selectedEquipment.assignedTo}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Condition</p>
                <Badge className="bg-blue-100 text-blue-800">{selectedEquipment.condition}</Badge>
              </div>
              <div>
                <p className="text-sm text-slate-500">Serial Number</p>
                <p className="font-medium">{selectedEquipment.serialNumber}</p>
              </div>
            </div>

            {/* Repair History */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Repair History</h3>
              <div className="space-y-3">
                {selectedEquipment.repairHistory.map((repair: any) => (
                  <Card key={repair.id} className="border-l-4 border-l-orange-400">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{repair.description}</p>
                          <p className="text-sm text-slate-600">{repair.notes}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${repair.cost}</p>
                          <p className="text-sm text-slate-500">{new Date(repair.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View Bill
                      </Button>
                    </CardContent>
                  </Card>
                ))}
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
                  <Label htmlFor="repairDate">Repair Date *</Label>
                  <Input
                    id="repairDate"
                    type="date"
                    value={repairData.repairDate}
                    onChange={(e) => setRepairData(prev => ({ ...prev, repairDate: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="repairCost">Repair Cost ($) *</Label>
                  <Input
                    id="repairCost"
                    type="number"
                    step="0.01"
                    value={repairData.repairCost}
                    onChange={(e) => setRepairData(prev => ({ ...prev, repairCost: e.target.value }))}
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

              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                Add Repair Record
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RepairDetails;
