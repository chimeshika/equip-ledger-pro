
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Search, FileText, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SearchEquipment = () => {
  const { toast } = useToast();
  const [searchSerial, setSearchSerial] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);

  // Mock comprehensive equipment data
  const mockEquipmentData = {
    itemName: "Dell Laptop XPS 13",
    category: "Computer",
    brand: "Dell XPS 13",
    serialNumber: "DL001234",
    purchaseDate: "2023-01-15",
    supplier: "Dell Direct",
    price: 1299.99,
    warrantyPeriod: "3 years",
    warrantyExpiry: "2026-01-15",
    location: "Office A - Desk 12",
    assignedTo: "John Smith",
    condition: "Good",
    notes: "Primary work laptop for development team",
    attachments: [
      { name: "purchase-receipt.pdf", type: "Receipt", date: "2023-01-15" },
      { name: "warranty-info.pdf", type: "Warranty", date: "2023-01-15" },
      { name: "user-manual.pdf", type: "Manual", date: "2023-01-15" }
    ],
    repairHistory: [
      {
        id: 1,
        date: "2023-11-15",
        cost: 125.50,
        description: "Screen replacement",
        notes: "Cracked screen from accidental drop",
        bill: "repair-bill-001.pdf"
      },
      {
        id: 2,
        date: "2023-08-20",
        cost: 75.00,
        description: "Battery replacement",
        notes: "Battery not holding charge properly",
        bill: "repair-bill-002.pdf"
      },
      {
        id: 3,
        date: "2023-05-10",
        cost: 45.00,
        description: "Keyboard cleaning",
        notes: "Sticky keys after coffee spill",
        bill: "repair-bill-003.pdf"
      }
    ]
  };

  const handleSearch = () => {
    if (searchSerial === "DL001234") {
      setSearchResults(mockEquipmentData);
      toast({
        title: "Equipment Found",
        description: `Found detailed information for ${mockEquipmentData.itemName}`,
      });
    } else {
      setSearchResults(null);
      toast({
        title: "Equipment Not Found",
        description: "No equipment found with that serial number",
        variant: "destructive"
      });
    }
  };

  const generatePDF = () => {
    // In a real app, this would generate and download a PDF
    toast({
      title: "PDF Generated",
      description: "Equipment report has been generated and downloaded",
    });
  };

  const totalRepairCost = searchResults?.repairHistory.reduce((sum: number, repair: any) => sum + repair.cost, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Equipment Database
          </CardTitle>
          <CardDescription>
            Enter serial number to retrieve complete equipment history and documentation
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

      {/* Search Results */}
      {searchResults && (
        <div className="space-y-6">
          {/* Equipment Overview */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{searchResults.itemName}</CardTitle>
                  <CardDescription>
                    Serial Number: {searchResults.serialNumber} | Category: {searchResults.category}
                  </CardDescription>
                </div>
                <Button onClick={generatePDF} className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800 border-b pb-2">Basic Information</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-slate-500">Brand/Model</p>
                      <p className="font-medium">{searchResults.brand}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Condition</p>
                      <Badge className="bg-blue-100 text-blue-800">{searchResults.condition}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Location</p>
                      <p className="font-medium">{searchResults.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Assigned To</p>
                      <p className="font-medium">{searchResults.assignedTo}</p>
                    </div>
                  </div>
                </div>

                {/* Purchase Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800 border-b pb-2">Purchase Information</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-slate-500">Purchase Date</p>
                      <p className="font-medium">{new Date(searchResults.purchaseDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Supplier</p>
                      <p className="font-medium">{searchResults.supplier}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Price</p>
                      <p className="font-medium">${searchResults.price.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Warranty Period</p>
                      <p className="font-medium">{searchResults.warrantyPeriod}</p>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800 border-b pb-2">Financial Summary</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-slate-500">Initial Cost</p>
                      <p className="font-medium">${searchResults.price.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Total Repair Cost</p>
                      <p className="font-medium text-orange-600">${totalRepairCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Total Investment</p>
                      <p className="font-medium text-slate-800">${(searchResults.price + totalRepairCost).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Warranty Status</p>
                      <Badge className={new Date(searchResults.warrantyExpiry) > new Date() ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {new Date(searchResults.warrantyExpiry) > new Date() ? "Active" : "Expired"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {searchResults.notes && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-slate-800 mb-2">Notes</h3>
                  <p className="text-slate-600">{searchResults.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Attachments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {searchResults.attachments.map((doc: any, index: number) => (
                  <Card key={index} className="border border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-slate-500">{doc.type}</p>
                          <p className="text-xs text-slate-500">{new Date(doc.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-3">
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Repair History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Complete Repair History
              </CardTitle>
              <CardDescription>
                Chronological record of all repairs and maintenance activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {searchResults.repairHistory.map((repair: any) => (
                  <Card key={repair.id} className="border-l-4 border-l-orange-400">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-800">{repair.description}</h4>
                          <p className="text-sm text-slate-600 mt-1">{repair.notes}</p>
                          <p className="text-sm text-slate-500 mt-2">
                            Date: {new Date(repair.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">${repair.cost.toFixed(2)}</p>
                          <Badge variant="outline" className="mt-1">
                            Repair #{repair.id}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          View Bill
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Summary */}
              <div className="mt-6 pt-6 border-t bg-slate-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{searchResults.repairHistory.length}</p>
                    <p className="text-sm text-slate-600">Total Repairs</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">${totalRepairCost.toFixed(2)}</p>
                    <p className="text-sm text-slate-600">Total Repair Cost</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">
                      ${(totalRepairCost / searchResults.repairHistory.length).toFixed(2)}
                    </p>
                    <p className="text-sm text-slate-600">Average Repair Cost</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SearchEquipment;
