
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Search, FileText, Calendar, QrCode, Camera, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEquipmentBySerial } from "@/hooks/useEquipment";
import { useRepairs } from "@/hooks/useRepairs";
import { generateEquipmentPDF } from "@/utils/pdfGenerator";
import QrScanner from "qr-scanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SearchEquipment = () => {
  const { toast } = useToast();
  const [searchSerial, setSearchSerial] = useState("");
  const [activeSearchSerial, setActiveSearchSerial] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [showScannerOptions, setShowScannerOptions] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: searchResults, isLoading: isSearching } = useEquipmentBySerial(activeSearchSerial);
  const { repairs } = useRepairs(searchResults?.id);

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

  const generatePDF = () => {
    if (!searchResults) {
      toast({
        title: "Error",
        description: "No equipment data available to export",
        variant: "destructive"
      });
      return;
    }

    try {
      generateEquipmentPDF(searchResults, repairs);
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

  const totalRepairCost = repairs.reduce((sum, repair) => sum + repair.repair_cost, 0);

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
            Enter serial number manually or scan a QR code to retrieve complete equipment history
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
          
          {activeSearchSerial && !searchResults && !isSearching && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">No equipment found with serial number: {activeSearchSerial}</p>
            </div>
          )}
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
                  <CardTitle>{searchResults.item_name}</CardTitle>
                  <CardDescription>
                    Serial Number: {searchResults.serial_number} | Category: {searchResults.category}
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
                      <p className="font-medium">{searchResults.location || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Assigned To</p>
                      <p className="font-medium">{searchResults.assigned_to || "Unassigned"}</p>
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
                        {searchResults.purchase_date 
                          ? new Date(searchResults.purchase_date).toLocaleDateString()
                          : "Not specified"
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Supplier</p>
                      <p className="font-medium">{searchResults.supplier || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Price</p>
                      <p className="font-medium">
                        {searchResults.price ? `$${searchResults.price.toLocaleString()}` : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Warranty Period</p>
                      <p className="font-medium">{searchResults.warranty_period || "Not specified"}</p>
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
                        {searchResults.price ? `$${searchResults.price.toLocaleString()}` : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Total Repair Cost</p>
                      <p className="font-medium text-orange-600">${totalRepairCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Total Investment</p>
                      <p className="font-medium text-slate-800">
                        ${((searchResults.price || 0) + totalRepairCost).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Warranty Status</p>
                      <Badge className={
                        searchResults.warranty_expiry && new Date(searchResults.warranty_expiry) > new Date() 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }>
                        {searchResults.warranty_expiry && new Date(searchResults.warranty_expiry) > new Date() 
                          ? "Active" 
                          : "Expired"
                        }
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

          {/* All Previous Records */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Complete Record History
              </CardTitle>
              <CardDescription>
                Chronological record of all repairs and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {repairs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-600">No records available.</p>
                </div>
              ) : (
                <>
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
                                Record #{repair.id.slice(0, 8)}
                              </Badge>
                            </div>
                          </div>
                          {repair.bill_attachment_url && (
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-2" />
                                View Document
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {/* Summary */}
                  <div className="mt-6 pt-6 border-t bg-slate-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-slate-800">{repairs.length}</p>
                        <p className="text-sm text-slate-600">Total Records</p>
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
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SearchEquipment;
