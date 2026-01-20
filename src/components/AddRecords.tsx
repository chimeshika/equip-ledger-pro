import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, FileText, Plus, QrCode, Camera, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEquipmentBySerial } from "@/hooks/useEquipment";
import { useRepairs } from "@/hooks/useRepairs";
import { useProfiles } from "@/hooks/useProfiles";
import { supabase } from "@/integrations/supabase/client";
import QrScanner from "qr-scanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatLKR } from "@/lib/currency";

const AddRecords = () => {
  const { toast } = useToast();
  const [searchSerial, setSearchSerial] = useState("");
  const [activeSearchSerial, setActiveSearchSerial] = useState("");
  const [recordType, setRecordType] = useState<"repair" | "update">("repair");
  const [isScanning, setIsScanning] = useState(false);
  const [showScannerOptions, setShowScannerOptions] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Repair form data
  const [repairData, setRepairData] = useState({
    repair_date: "",
    repair_cost: "",
    description: "",
    notes: ""
  });

  // Update form data
  const [updateData, setUpdateData] = useState({
    date: "",
    condition: "",
    assigned_to: "",
    warranty_period: "",
    warranty_expiry: "",
    notes: ""
  });

  const [repairBill, setRepairBill] = useState<File | null>(null);
  const [updateDocument, setUpdateDocument] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: selectedEquipment, isLoading: isSearching, refetch: refetchEquipment } = useEquipmentBySerial(activeSearchSerial);
  const { repairs, addRepair, isAdding } = useRepairs(selectedEquipment?.id);
  const { profiles } = useProfiles();

  // Find the creator of the equipment
  const equipmentCreator = profiles.find(profile => profile.id === selectedEquipment?.created_by);

  const handleSearch = () => {
    if (!searchSerial.trim()) {
      toast({
        title: "Search Error",
        description: "Please enter a serial number",
        variant: "destructive"
      });
      return;
    }

    setActiveSearchSerial(searchSerial.trim());
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      toast({
        title: "Processing QR Code",
        description: "Reading QR code from uploaded image...",
      });

      const result = await QrScanner.scanImage(file);
      
      try {
        // Parse QR code data - it should contain equipment info
        const data = JSON.parse(result);
        if (data.serial_number) {
          setActiveSearchSerial(data.serial_number);
          setSearchSerial(data.serial_number);
          setShowScannerOptions(false);
          toast({
            title: "QR Code Read Successfully",
            description: `Found equipment: ${data.serial_number}`,
          });
        } else {
          throw new Error("Invalid QR code format");
        }
      } catch (error) {
        // If parsing fails, treat as plain text serial number
        setActiveSearchSerial(result);
        setSearchSerial(result);
        setShowScannerOptions(false);
        toast({
          title: "QR Code Read Successfully",
          description: `Searching for: ${result}`,
        });
      }
    } catch (error) {
      console.error('Error reading QR code:', error);
      toast({
        title: "QR Code Error",
        description: "Unable to read QR code from the image. Please try again.",
        variant: "destructive"
      });
    }
    
    // Reset file input
    if (event.target) {
      event.target.value = '';
    }
  };

  const startScannerOptions = () => {
    setShowScannerOptions(true);
  };

  const closeScannerOptions = () => {
    setShowScannerOptions(false);
    stopQrScanner();
  };

  const startQrScanner = async () => {
    if (!videoRef.current) return;

    try {
      setIsScanning(true);
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          try {
            // Parse QR code data - it should contain equipment info
            const data = JSON.parse(result.data);
            if (data.serial_number) {
              setActiveSearchSerial(data.serial_number);
              setSearchSerial(data.serial_number);
              closeScannerOptions();
              toast({
                title: "QR Code Scanned",
                description: `Found equipment: ${data.serial_number}`,
              });
            } else {
              throw new Error("Invalid QR code format");
            }
          } catch (error) {
            // If parsing fails, treat as plain text serial number
            setActiveSearchSerial(result.data);
            setSearchSerial(result.data);
            closeScannerOptions();
            toast({
              title: "QR Code Scanned",
              description: `Searching for: ${result.data}`,
            });
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      
      scannerRef.current = scanner;
      await scanner.start();
    } catch (error) {
      console.error('Error starting QR scanner:', error);
      setIsScanning(false);
      toast({
        title: "Scanner Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopQrScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopQrScanner();
    };
  }, []);

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

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEquipment) {
      toast({
        title: "Error",
        description: "No equipment selected for update",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);

    try {
      // Prepare update data - only include fields that have values
      const updateFields: any = {};
      
      if (updateData.condition) {
        updateFields.condition = updateData.condition;
      }
      
      if (updateData.assigned_to) {
        updateFields.assigned_to = updateData.assigned_to;
      }
      
      if (updateData.warranty_period) {
        updateFields.warranty_period = updateData.warranty_period;
      }
      
      if (updateData.warranty_expiry) {
        updateFields.warranty_expiry = updateData.warranty_expiry;
      }

      // Add updated_at timestamp
      updateFields.updated_at = new Date().toISOString();

      // Update equipment in database
      const { error } = await supabase
        .from('equipment')
        .update(updateFields)
        .eq('id', selectedEquipment.id);

      if (error) throw error;

      toast({
        title: "Equipment Updated",
        description: "Equipment details have been successfully updated.",
      });

      // Refresh equipment data to show updated values
      refetchEquipment();

      // Reset form
      setUpdateData({
        date: "",
        condition: "",
        assigned_to: "",
        warranty_period: "",
        warranty_expiry: "",
        notes: ""
      });
      setUpdateDocument(null);

    } catch (error) {
      console.error('Error updating equipment:', error);
      toast({
        title: "Error",
        description: "Failed to update equipment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRepairFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setRepairBill(e.target.files[0]);
    }
  };

  const handleUpdateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUpdateDocument(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Equipment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Equipment for Records
          </CardTitle>
          <CardDescription>
            Enter serial number manually or scan a QR code to find equipment and manage records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Manual Search
              </TabsTrigger>
              <TabsTrigger value="qr" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                QR Scanner
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="searchSerial">Serial Number</Label>
                  <Input
                    id="searchSerial"
                    value={searchSerial}
                    onChange={(e) => setSearchSerial(e.target.value)}
                    placeholder="Enter serial number"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleSearch} disabled={isSearching}>
                    <Search className="h-4 w-4 mr-2" />
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="qr" className="space-y-4">
              <div className="text-center space-y-4">
                {!showScannerOptions ? (
                  <div className="space-y-4">
                    <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <QrCode className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 mb-4">Scan QR code to find equipment</p>
                      <Button onClick={startScannerOptions} className="flex items-center gap-2 mx-auto">
                        <QrCode className="h-4 w-4" />
                        Start Scanner
                      </Button>
                    </div>
                  </div>
                ) : !isScanning ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Choose Scan Method</h3>
                      <Button
                        onClick={closeScannerOptions}
                        variant="ghost"
                        size="sm"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Upload Image Option */}
                      <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                        <div className="text-center space-y-3">
                          <FileText className="h-12 w-12 mx-auto text-gray-400" />
                          <h4 className="font-medium text-gray-900">Upload QR Image</h4>
                          <p className="text-sm text-gray-600">Select a QR code image from your device</p>
                          <Button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2"
                            variant="outline"
                          >
                            <FileText className="h-4 w-4" />
                            Choose File
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </div>
                      </div>
                      
                      {/* Camera Scan Option */}
                      <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                        <div className="text-center space-y-3">
                          <Camera className="h-12 w-12 mx-auto text-gray-400" />
                          <h4 className="font-medium text-gray-900">Use Camera</h4>
                          <p className="text-sm text-gray-600">Scan QR code using your device camera</p>
                          <Button
                            onClick={startQrScanner}
                            className="flex items-center gap-2"
                            variant="outline"
                          >
                            <Camera className="h-4 w-4" />
                            Open Camera
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Camera Scanner</h3>
                      <Button
                        onClick={closeScannerOptions}
                        variant="destructive"
                        size="sm"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="relative">
                      <video
                        ref={videoRef}
                        className="w-full max-w-sm mx-auto rounded-lg border"
                        style={{ maxHeight: '400px' }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      Position the QR code within the camera view to scan
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          {activeSearchSerial && !selectedEquipment && !isSearching && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">No equipment found with serial number: {activeSearchSerial}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Equipment Details */}
      {selectedEquipment && (
        <Card>
          <CardHeader>
            <CardTitle>Equipment Details</CardTitle>
            {equipmentCreator && (
              <CardDescription>
                Added by: {equipmentCreator.full_name || equipmentCreator.email}
              </CardDescription>
            )}
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
              <div>
                <p className="text-sm text-slate-500">Warranty Period</p>
                <p className="font-medium">{selectedEquipment.warranty_period || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Warranty Expiry</p>
                <p className="font-medium">
                  {selectedEquipment.warranty_expiry 
                    ? new Date(selectedEquipment.warranty_expiry).toLocaleDateString()
                    : "Not specified"
                  }
                </p>
              </div>
            </div>

            {/* Previous Records History */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Previous Records</h3>
              <div className="space-y-3">
                {repairs.length === 0 ? (
                  <p className="text-slate-500">No previous records available.</p>
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
                            <p className="font-medium">{formatLKR(repair.repair_cost)}</p>
                            <p className="text-sm text-slate-500">{new Date(repair.repair_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {repair.bill_attachment_url && (
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            View Document
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

      {/* Add New Record */}
      {selectedEquipment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Record
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Record Type Selection */}
              <div>
                <Label htmlFor="recordType">Record Type</Label>
                <Select value={recordType} onValueChange={(value: "repair" | "update") => setRecordType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select record type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Repair Form */}
              {recordType === "repair" && (
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
                      <Label htmlFor="repair_cost">Repair Cost (Rs.) *</Label>
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
                      onChange={handleRepairFileChange}
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
              )}

              {/* Update Form */}
              {recordType === "update" && (
                <form onSubmit={handleUpdateSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="update_date">Date *</Label>
                      <Input
                        id="update_date"
                        type="date"
                        value={updateData.date}
                        onChange={(e) => setUpdateData(prev => ({ ...prev, date: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="condition">Change Condition</Label>
                      <Select value={updateData.condition} onValueChange={(value) => setUpdateData(prev => ({ ...prev, condition: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                          <SelectItem value="out of service">Out of Service</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="assigned_to">Change Assigned To</Label>
                      <Input
                        id="assigned_to"
                        value={updateData.assigned_to}
                        onChange={(e) => setUpdateData(prev => ({ ...prev, assigned_to: e.target.value }))}
                        placeholder="Enter person or department"
                      />
                    </div>

                    <div>
                      <Label htmlFor="warranty_period">Change Warranty Period</Label>
                      <Input
                        id="warranty_period"
                        value={updateData.warranty_period}
                        onChange={(e) => setUpdateData(prev => ({ ...prev, warranty_period: e.target.value }))}
                        placeholder="e.g., 12 months, 2 years"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="warranty_expiry">Warranty Expiry Date</Label>
                    <Input
                      id="warranty_expiry"
                      type="date"
                      value={updateData.warranty_expiry}
                      onChange={(e) => setUpdateData(prev => ({ ...prev, warranty_expiry: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="update_notes">Notes</Label>
                    <Textarea
                      id="update_notes"
                      value={updateData.notes}
                      onChange={(e) => setUpdateData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Any additional details about the update..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="updateDocument">Document Attachments</Label>
                    <Input
                      id="updateDocument"
                      type="file"
                      onChange={handleUpdateFileChange}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                    <p className="text-sm text-slate-500 mt-1">
                      Upload any relevant documents for this update
                    </p>
                  </div>

                  <Button type="submit" disabled={isUpdating}>
                    <Plus className="h-4 w-4 mr-2" />
                    {isUpdating ? "Updating Equipment..." : "Add Update Record"}
                  </Button>
                </form>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AddRecords;
