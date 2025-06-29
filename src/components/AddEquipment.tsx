
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useEquipment } from "@/hooks/useEquipment";

const AddEquipment = () => {
  const { addEquipment, isAdding } = useEquipment();
  const [formData, setFormData] = useState({
    item_name: "",
    category: "",
    subcategory: "",
    brand: "",
    serial_number: "",
    purchase_date: "",
    supplier: "",
    price: "",
    warranty_period: "",
    warranty_expiry: "",
    service_agreement_duration: "",
    service_agreement_expiry: "",
    location: "",
    assigned_to: "",
    condition: "",
    notes: ""
  });

  const [attachments, setAttachments] = useState<File[]>([]);

  const categories = [
    "Computers", 
    "Desktop", 
    "External hard drives", 
    "Internal hard drives", 
    "Headsets",
    "Keyboards", 
    "Landline phones",
    "Laptops",
    "Mice",
    "Microphones",
    "Speakers",
    "UPS",
    "Monitors",
    "Multifunction printers",
    "Type of Network",
    "Pen Drive capacity",
    "Laser Printers",
    "Dot Matrix Printers",
    "Ink Tank Printers", 
    "Projectors",
    "Routers"
  ];

  const subcategories = {
    "External hard drives": ["500GB", "1TB", "2TB", "4TB"],
    "Internal hard drives": ["SATA", "SSD", "NVME", "M.2 SSD"],
    "Keyboards": ["Keyboards", "Mouse"],
    "Laptops": ["Laptops", "Charger", "Bag"],
    "Monitors": ["LCD", "LED"],
    "Multifunction printers": ["Black and White", "Color"],
    "Type of Network": ["RJ 44", "USB Wi-Fi Dongles", "External", "Internal", "Network card internal"],
    "Pen Drive capacity": ["8GB", "16GB", "32GB", "64GB", "128GB"],
    "Laser Printers": ["Black and White", "Color"],
    "Ink Tank Printers": ["Black and White", "Color"],
    "Projectors": ["Projector screen 72\"", "Projector screen 92\"", "Projector screen 106\"", "Projector screen 120\"", "Projector Remote", "Projector bag"]
  };

  const conditions = ["Excellent", "Good", "Fair", "Poor", "Out of Service"];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value,
      // Reset subcategory when category changes
      ...(field === 'category' && { subcategory: '' })
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare data for submission
    const equipmentData = {
      item_name: formData.item_name,
      category: formData.subcategory ? `${formData.category} - ${formData.subcategory}` : formData.category,
      brand: formData.brand,
      serial_number: formData.serial_number,
      purchase_date: formData.purchase_date || null,
      supplier: formData.supplier || null,
      price: formData.price ? parseFloat(formData.price) : null,
      warranty_period: formData.warranty_period || null,
      warranty_expiry: formData.warranty_expiry || null,
      location: formData.location || null,
      assigned_to: formData.assigned_to || null,
      condition: formData.condition,
      notes: formData.notes || null,
    };

    addEquipment(equipmentData);

    // Reset form on success
    setFormData({
      item_name: "", category: "", subcategory: "", brand: "", serial_number: "", purchase_date: "",
      supplier: "", price: "", warranty_period: "", warranty_expiry: "", service_agreement_duration: "",
      service_agreement_expiry: "", location: "", assigned_to: "", condition: "", notes: ""
    });
    setAttachments([]);
  };

  const showSubcategory = formData.category && subcategories[formData.category as keyof typeof subcategories];

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Basic Information</h3>
              
              <div>
                <Label htmlFor="item_name">Item Name *</Label>
                <Input
                  id="item_name"
                  value={formData.item_name}
                  onChange={(e) => handleInputChange("item_name", e.target.value)}
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

              {showSubcategory && (
                <div>
                  <Label htmlFor="subcategory">Specification *</Label>
                  <Select value={formData.subcategory} onValueChange={(value) => handleInputChange("subcategory", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select specification" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories[formData.category as keyof typeof subcategories].map((sub) => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
                <Label htmlFor="serial_number">Serial Number *</Label>
                <Input
                  id="serial_number"
                  value={formData.serial_number}
                  onChange={(e) => handleInputChange("serial_number", e.target.value)}
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
                <Label htmlFor="purchase_date">Purchase Date</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => handleInputChange("purchase_date", e.target.value)}
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
                <Label htmlFor="warranty_period">Warranty Duration</Label>
                <Input
                  id="warranty_period"
                  value={formData.warranty_period}
                  onChange={(e) => handleInputChange("warranty_period", e.target.value)}
                  placeholder="e.g., 3 years, 12 months"
                />
              </div>

              <div>
                <Label htmlFor="warranty_expiry">Warranty Expiry Date</Label>
                <Input
                  id="warranty_expiry"
                  type="date"
                  value={formData.warranty_expiry}
                  onChange={(e) => handleInputChange("warranty_expiry", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="service_agreement_duration">Service Agreement Duration</Label>
                <Input
                  id="service_agreement_duration"
                  value={formData.service_agreement_duration}
                  onChange={(e) => handleInputChange("service_agreement_duration", e.target.value)}
                  placeholder="e.g., 2 years, 24 months"
                />
              </div>

              <div>
                <Label htmlFor="service_agreement_expiry">Service Agreement Expiry Date</Label>
                <Input
                  id="service_agreement_expiry"
                  type="date"
                  value={formData.service_agreement_expiry}
                  onChange={(e) => handleInputChange("service_agreement_expiry", e.target.value)}
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
              <Label htmlFor="assigned_to">Assigned To</Label>
              <Input
                id="assigned_to"
                value={formData.assigned_to}
                onChange={(e) => handleInputChange("assigned_to", e.target.value)}
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

          <Button type="submit" className="w-full md:w-auto" disabled={isAdding}>
            <Plus className="h-4 w-4 mr-2" />
            {isAdding ? "Adding Equipment..." : "Add Equipment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddEquipment;
