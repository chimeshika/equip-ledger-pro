
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Equipment } from "@/hooks/useEquipment";
import { useNavigate } from "react-router-dom";

interface EquipmentCardProps {
  equipment: Equipment;
}

const EquipmentCard = ({ equipment }: EquipmentCardProps) => {
  const navigate = useNavigate();

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "excellent": return "bg-green-100 text-green-800";
      case "good": return "bg-blue-100 text-blue-800";
      case "fair": return "bg-yellow-100 text-yellow-800";
      case "poor": return "bg-orange-100 text-orange-800";
      case "out of service": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const isWarrantyExpiring = () => {
    if (!equipment.warranty_expiry) return false;
    const expiryDate = new Date(equipment.warranty_expiry);
    const now = new Date();
    const monthsUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsUntilExpiry <= 6 && monthsUntilExpiry > 0;
  };

  const handleViewDetails = () => {
    navigate(`/equipment/${equipment.serial_number}`);
  };

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg text-slate-800">{equipment.item_name}</h3>
            <p className="text-slate-600">{equipment.brand} • SN: {equipment.serial_number}</p>
          </div>
          <div className="flex gap-2">
            <Badge className={getConditionColor(equipment.condition)}>
              {equipment.condition}
            </Badge>
            {isWarrantyExpiring() && (
              <Badge variant="destructive">Warranty Expiring</Badge>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Category</p>
            <p className="font-medium">{equipment.category}</p>
          </div>
          <div>
            <p className="text-slate-500">Location</p>
            <p className="font-medium">{equipment.location || "Not specified"}</p>
          </div>
          <div>
            <p className="text-slate-500">Assigned To</p>
            <p className="font-medium">{equipment.assigned_to || "Unassigned"}</p>
          </div>
          <div>
            <p className="text-slate-500">Price</p>
            <p className="font-medium">{equipment.price ? `$${equipment.price.toLocaleString()}` : "Not specified"}</p>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
          <div className="text-sm text-slate-600">
            {equipment.warranty_expiry 
              ? `Warranty expires: ${new Date(equipment.warranty_expiry).toLocaleDateString()}`
              : "No warranty information"
            }
          </div>
          <Button variant="outline" size="sm" onClick={handleViewDetails}>
            <FileText className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipmentCard;
