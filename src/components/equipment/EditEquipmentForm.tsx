
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X } from "lucide-react";
import { Equipment } from "@/hooks/useEquipment";

interface EditEquipmentFormProps {
  equipment: Equipment;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const EditEquipmentForm = ({ equipment, onSave, onCancel }: EditEquipmentFormProps) => {
  const [formData, setFormData] = useState({
    item_name: equipment.item_name,
    brand: equipment.brand,
    category: equipment.category,
    condition: equipment.condition,
    location: equipment.location || "",
    assigned_to: equipment.assigned_to || "",
    supplier: equipment.supplier || "",
    price: equipment.price || "",
    warranty_period: equipment.warranty_period || "",
    purchase_date: equipment.purchase_date || "",
    warranty_expiry: equipment.warranty_expiry || "",
    service_agreement_duration: "",
    service_agreement_expiry: "",
    notes: equipment.notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: formData.price ? parseFloat(formData.price.toString()) : null,
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Equipment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="item_name">Item Name *</Label>
              <Input
                id="item_name"
                value={formData.item_name}
                onChange={(e) => handleChange('item_name', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="brand">Brand/Model *</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="condition">Condition *</Label>
              <Select value={formData.condition} onValueChange={(value) => handleChange('condition', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                  <SelectItem value="Out of Service">Out of Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Building, room, or area"
              />
            </div>

            <div>
              <Label htmlFor="assigned_to">Assigned To</Label>
              <Input
                id="assigned_to"
                value={formData.assigned_to}
                onChange={(e) => handleChange('assigned_to', e.target.value)}
                placeholder="Person or department"
              />
            </div>

            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => handleChange('supplier', e.target.value)}
                placeholder="Vendor or supplier name"
              />
            </div>

            <div>
              <Label htmlFor="price">Purchase Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="warranty_period">Warranty Duration</Label>
              <Input
                id="warranty_period"
                value={formData.warranty_period}
                onChange={(e) => handleChange('warranty_period', e.target.value)}
                placeholder="e.g., 2 years, 36 months"
              />
            </div>

            <div>
              <Label htmlFor="purchase_date">Purchase Date</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => handleChange('purchase_date', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="warranty_expiry">Warranty Expiry Date</Label>
              <Input
                id="warranty_expiry"
                type="date"
                value={formData.warranty_expiry}
                onChange={(e) => handleChange('warranty_expiry', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="service_agreement_duration">Service Agreement Duration</Label>
              <Input
                id="service_agreement_duration"
                value={formData.service_agreement_duration}
                onChange={(e) => handleChange('service_agreement_duration', e.target.value)}
                placeholder="e.g., 2 years, 24 months"
              />
            </div>

            <div>
              <Label htmlFor="service_agreement_expiry">Service Agreement Expiry Date</Label>
              <Input
                id="service_agreement_expiry"
                type="date"
                value={formData.service_agreement_expiry}
                onChange={(e) => handleChange('service_agreement_expiry', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes, specifications, or comments"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditEquipmentForm;
