
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
      <div className="absolute top-0 right-0 w-16 h-16 md:w-24 md:h-24 bg-blue-500/5 rounded-full -translate-y-8 md:-translate-y-12 translate-x-8 md:translate-x-12 group-hover:scale-150 transition-transform duration-500"></div>
      <div className="absolute bottom-0 left-0 w-12 h-12 md:w-16 md:h-16 bg-purple-500/5 rounded-full translate-y-6 md:translate-y-8 -translate-x-6 md:-translate-x-8 group-hover:scale-150 transition-transform duration-500"></div>

      <CardContent className="p-4 md:p-6 relative z-10">
        {/* Header Section - Mobile Optimized */}
        <div className="flex justify-between items-start mb-3 md:mb-4">
          <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-solid-blue rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Zap className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-1 truncate">{equipment.item_name}</h3>
              <p className="text-slate-600 font-medium text-sm md:text-base truncate">{equipment.brand}</p>
              <p className="text-xs md:text-sm text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded-lg mt-1 inline-block">
                SN: {equipment.serial_number}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 items-end flex-shrink-0 ml-2">
            <div className="flex items-center gap-2">
              <div className={conditionConfig.dot}></div>
              <Badge className={`${conditionConfig.badge} border-0 text-xs`}>
                {equipment.condition}
              </Badge>
            </div>
            {isWarrantyExpiring() && (
              <Badge className="badge-solid-danger border-0 animate-pulse-soft text-xs">
                Service Expiring
              </Badge>
            )}
          </div>
        </div>
        
        {/* Information Grid - Mobile Responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-3 md:mb-4">
          <div className="glass rounded-lg md:rounded-xl p-2 md:p-3 text-center">
            <div className="flex items-center justify-center mb-1 md:mb-2">
              <Package className="h-3 w-3 md:h-4 md:w-4 text-slate-600" />
            </div>
            <p className="text-xs text-slate-500 font-medium mb-1">Category</p>
            <p className="font-semibold text-slate-800 text-xs md:text-sm truncate">{equipment.category}</p>
          </div>
          
          <div className="glass rounded-lg md:rounded-xl p-2 md:p-3 text-center">
            <div className="flex items-center justify-center mb-1 md:mb-2">
              <MapPin className="h-3 w-3 md:h-4 md:w-4 text-slate-600" />
            </div>
            <p className="text-xs text-slate-500 font-medium mb-1">Location</p>
            <p className="font-semibold text-slate-800 text-xs md:text-sm truncate">{equipment.location || "Not specified"}</p>
          </div>
          
          <div className="glass rounded-lg md:rounded-xl p-2 md:p-3 text-center">
            <div className="flex items-center justify-center mb-1 md:mb-2">
              <User className="h-3 w-3 md:h-4 md:w-4 text-slate-600" />
            </div>
            <p className="text-xs text-slate-500 font-medium mb-1">Assigned</p>
            <p className="font-semibold text-slate-800 text-xs md:text-sm truncate">{equipment.assigned_to || "Unassigned"}</p>
          </div>
          
          <div className="glass rounded-lg md:rounded-xl p-2 md:p-3 text-center">
            <div className="flex items-center justify-center mb-1 md:mb-2">
              <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-slate-600" />
            </div>
            <p className="text-xs text-slate-500 font-medium mb-1">Price</p>
            <p className="font-semibold text-slate-800 text-xs md:text-sm">
              {equipment.price ? `$${equipment.price.toLocaleString()}` : "N/A"}
            </p>
          </div>
        </div>
        
        {/* Footer Section - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-3 md:pt-4 border-t border-slate-200/50">
          <div className="flex items-center gap-2 min-w-0">
            <Calendar className="h-3 w-3 md:h-4 md:w-4 text-slate-500 flex-shrink-0" />
            <div className="text-xs md:text-sm text-slate-600 font-medium truncate">
              {equipment.warranty_expiry 
                ? `Service: ${new Date(equipment.warranty_expiry).toLocaleDateString()}`
                : "No service info"
              }
            </div>
          </div>
          
          <Button 
            onClick={handleViewDetails}
            className="btn-modern text-xs md:text-sm py-2 px-3 md:px-4 h-auto w-full sm:w-auto"
          >
            <FileText className="h-3 w-3 md:h-4 md:w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipmentCard;
