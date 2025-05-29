
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, MapPin, User, DollarSign, Calendar, Zap, Package } from "lucide-react";
import { Equipment } from "@/hooks/useEquipment";
import { useNavigate } from "react-router-dom";

interface EquipmentCardProps {
  equipment: Equipment;
}

const EquipmentCard = ({ equipment }: EquipmentCardProps) => {
  const navigate = useNavigate();

  const getConditionConfig = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "excellent": 
        return { 
          badge: "badge-solid-success shadow-lg", 
          dot: "status-excellent",
          border: "border-green-200"
        };
      case "good": 
        return { 
          badge: "badge-solid-info shadow-lg", 
          dot: "status-good",
          border: "border-blue-200"
        };
      case "fair": 
        return { 
          badge: "badge-solid-warning shadow-lg", 
          dot: "status-fair",
          border: "border-yellow-200"
        };
      case "poor": 
        return { 
          badge: "badge-solid-danger shadow-lg", 
          dot: "status-poor",
          border: "border-orange-200"
        };
      case "out of service": 
        return { 
          badge: "badge-solid-secondary shadow-lg", 
          dot: "status-out-of-service",
          border: "border-red-200"
        };
      default: 
        return { 
          badge: "bg-gray-100 text-gray-800", 
          dot: "w-3 h-3 bg-gray-400 rounded-full",
          border: "border-gray-200"
        };
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

  const conditionConfig = getConditionConfig(equipment.condition);

  return (
    <Card variant="floating" className={`relative overflow-hidden border-l-4 ${conditionConfig.border} group`}>
      {/* Animated Background Elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-500/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-150 transition-transform duration-500"></div>

      <CardContent className="p-6 relative z-10">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-solid-blue rounded-2xl flex items-center justify-center shadow-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">{equipment.item_name}</h3>
              <p className="text-slate-600 font-medium">{equipment.brand}</p>
              <p className="text-sm text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded-lg mt-1">
                SN: {equipment.serial_number}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 items-end">
            <div className="flex items-center gap-2">
              <div className={conditionConfig.dot}></div>
              <Badge className={`${conditionConfig.badge} border-0`}>
                {equipment.condition}
              </Badge>
            </div>
            {isWarrantyExpiring() && (
              <Badge className="badge-solid-danger border-0 animate-pulse-soft">
                Warranty Expiring
              </Badge>
            )}
          </div>
        </div>
        
        {/* Information Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="glass rounded-xl p-3 text-center">
            <div className="flex items-center justify-center mb-2">
              <Package className="h-4 w-4 text-slate-600" />
            </div>
            <p className="text-xs text-slate-500 font-medium mb-1">Category</p>
            <p className="font-semibold text-slate-800 text-sm">{equipment.category}</p>
          </div>
          
          <div className="glass rounded-xl p-3 text-center">
            <div className="flex items-center justify-center mb-2">
              <MapPin className="h-4 w-4 text-slate-600" />
            </div>
            <p className="text-xs text-slate-500 font-medium mb-1">Location</p>
            <p className="font-semibold text-slate-800 text-sm">{equipment.location || "Not specified"}</p>
          </div>
          
          <div className="glass rounded-xl p-3 text-center">
            <div className="flex items-center justify-center mb-2">
              <User className="h-4 w-4 text-slate-600" />
            </div>
            <p className="text-xs text-slate-500 font-medium mb-1">Assigned To</p>
            <p className="font-semibold text-slate-800 text-sm">{equipment.assigned_to || "Unassigned"}</p>
          </div>
          
          <div className="glass rounded-xl p-3 text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="h-4 w-4 text-slate-600" />
            </div>
            <p className="text-xs text-slate-500 font-medium mb-1">Price</p>
            <p className="font-semibold text-slate-800 text-sm">
              {equipment.price ? `$${equipment.price.toLocaleString()}` : "Not specified"}
            </p>
          </div>
        </div>
        
        {/* Footer Section */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200/50">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-500" />
            <div className="text-sm text-slate-600 font-medium">
              {equipment.warranty_expiry 
                ? `Warranty: ${new Date(equipment.warranty_expiry).toLocaleDateString()}`
                : "No warranty info"
              }
            </div>
          </div>
          
          <Button 
            onClick={handleViewDetails}
            className="btn-modern text-sm py-2 px-4 h-auto"
          >
            <FileText className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipmentCard;
