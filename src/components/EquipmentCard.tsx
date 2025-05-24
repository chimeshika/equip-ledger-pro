
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface Equipment {
  id: string;
  itemName: string;
  category: string;
  brand: string;
  serialNumber: string;
  purchaseDate: string;
  supplier: string;
  price: number;
  warrantyPeriod: string;
  warrantyExpiry: string;
  location: string;
  assignedTo: string;
  condition: string;
  notes: string;
}

interface EquipmentCardProps {
  equipment: Equipment;
}

const EquipmentCard = ({ equipment }: EquipmentCardProps) => {
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
    const expiryDate = new Date(equipment.warrantyExpiry);
    const now = new Date();
    const monthsUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsUntilExpiry <= 6 && monthsUntilExpiry > 0;
  };

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg text-slate-800">{equipment.itemName}</h3>
            <p className="text-slate-600">{equipment.brand} • SN: {equipment.serialNumber}</p>
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
            <p className="font-medium">{equipment.location}</p>
          </div>
          <div>
            <p className="text-slate-500">Assigned To</p>
            <p className="font-medium">{equipment.assignedTo}</p>
          </div>
          <div>
            <p className="text-slate-500">Price</p>
            <p className="font-medium">${equipment.price.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
          <div className="text-sm text-slate-600">
            Warranty expires: {new Date(equipment.warrantyExpiry).toLocaleDateString()}
          </div>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipmentCard;
