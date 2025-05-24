
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

const AddEquipment = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    brand: "",
    serialNumber: "",
    purchaseDate: "",
    supplier: "",
    price: "",
    warrantyPeriod: "",
    warrantyExpiry: "",
    location: "",
    assignedTo: "",
    condition: "",
    notes: ""
  });

  const [attachments, setAttachments] = useState<File[]>([]);

  const categories = [
    "Computer", "Mobile Device", "Printer", "Monitor", "Furniture", 
    "Audio/Video", "Network Equipment", "Software", "Vehicle", "Other"
  ];

  const conditions = ["Excellent", "Good", "Fair", "Poor", "Out of Service"];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would typically save to Supabase
    console.log("Equipment data:", formData);
    console.log("Attachments:", attachments);
    
    toast({
      title: "Equipment Added",
      description: `${formData.itemName} has been successfully registered.`,
    });

    // Reset form
    setFormData({
      itemName: "", category: "", brand: "", serialNumber: "", purchaseDate: "",
      supplier: "", price: "", warrantyPeriod: "", warrantyExpiry: "",
      location: "", assignedTo: "", condition: "", notes: ""
    });
    setAttachments([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add New Equipment
        </CardTitle>
        <CardDescription>
          Register new equipment in your inventory system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Basic Information</h3>
              
              <div>
                <Label htmlFor="itemName">Item Name *</Label>
                <Input
                  id="itemName"
                  value={formData.itemName}
                  onChange={(e) => handleInputChange("itemName", e.target.value)}
                  placeholder="e.g., Dell Laptop XPS 13"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="brand">Brand/Model *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleInputChange("brand", e.target.value)}
                  placeholder="e.g., Dell XPS 13"
                  required
                />
              </div>

              <div>
                <Label htmlFor="serialNumber">Serial Number *</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => handleInputChange("serialNumber", e.target.value)}
                  placeholder="Unique serial number"
                  required
                />
              </div>

              <div>
                <Label htmlFor="condition">Condition *</Label>
                <Select value={formData.condition} onValueChange={(value) => handleInputChange("condition", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((condition) => (
                      <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Purchase & Warranty Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Purchase & Warranty</h3>
              
              <div>
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => handleInputChange("purchaseDate", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => handleInputChange("supplier", e.target.value)}
                  placeholder="e.g., Dell Direct, Amazon"
                />
              </div>

              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="warrantyPeriod">Warranty Period</Label>
                <Input
                  id="warrantyPeriod"
                  value={formData.warrantyPeriod}
                  onChange={(e) => handleInputChange("warrantyPeriod", e.target.value)}
                  placeholder="e.g., 3 years, 12 months"
                />
              </div>

              <div>
                <Label htmlFor="warrantyExpiry">Warranty Expiry Date</Label>
                <Input
                  id="warrantyExpiry"
                  type="date"
                  value={formData.warrantyExpiry}
                  onChange={(e) => handleInputChange("warrantyExpiry", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Location & Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="e.g., Office A - Desk 12"
              />
            </div>

            <div>
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => handleInputChange("assignedTo", e.target.value)}
                placeholder="e.g., John Smith"
              />
            </div>
          </div>

          {/* Notes and Attachments */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Additional notes or comments..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="attachments">Document Attachments</Label>
              <Input
                id="attachments"
                type="file"
                multiple
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <p className="text-sm text-slate-500 mt-1">
                Upload receipts, manuals, or other related documents
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddEquipment;
