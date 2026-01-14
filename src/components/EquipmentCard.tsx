import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, MapPin, User, DollarSign, Calendar, Package } from "lucide-react";
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
          badge: "badge-gov-success", 
          dot: "status-excellent",
          border: "border-l-green-600"
        };
      case "good": 
        return { 
          badge: "badge-gov-info", 
          dot: "status-good",
          border: "border-l-blue-600"
        };
      case "fair": 
        return { 
          badge: "badge-gov-gold", 
          dot: "status-fair",
          border: "border-l-amber-500"
        };
      case "poor": 
        return { 
          badge: "badge-gov-warning", 
          dot: "status-poor",
          border: "border-l-orange-500"
        };
      case "out of service": 
        return { 
          badge: "badge-gov-danger", 
          dot: "status-out-of-service",
          border: "border-l-red-600"
        };
      default: 
        return { 
          badge: "badge-solid-secondary", 
          dot: "status-dot bg-gray-400",
          border: "border-l-gray-400"
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
    <Card className={`border border-border border-l-4 ${conditionConfig.border} shadow-gov hover-lift`}>
      <CardContent className="p-4">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 bg-secondary rounded flex items-center justify-center flex-shrink-0">
              <Package className="h-4 w-4 text-secondary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-foreground mb-0.5 truncate">{equipment.item_name}</h3>
              <p className="text-muted-foreground text-sm truncate">{equipment.brand}</p>
              <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded mt-1 inline-block">
                SN: {equipment.serial_number}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5 items-end flex-shrink-0 ml-2">
            <div className="flex items-center gap-2">
              <div className={conditionConfig.dot}></div>
              <Badge className={conditionConfig.badge}>
                {equipment.condition}
              </Badge>
            </div>
            {isWarrantyExpiring() && (
              <Badge className="badge-gov-danger animate-pulse-soft">
                Service Expiring
              </Badge>
            )}
          </div>
        </div>
        
        {/* Information Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
          <div className="bg-muted/50 rounded p-2 text-center">
            <div className="flex items-center justify-center mb-1">
              <Package className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mb-0.5">Category</p>
            <p className="font-medium text-foreground text-xs truncate">{equipment.category}</p>
          </div>
          
          <div className="bg-muted/50 rounded p-2 text-center">
            <div className="flex items-center justify-center mb-1">
              <MapPin className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mb-0.5">Location</p>
            <p className="font-medium text-foreground text-xs truncate">{equipment.location || "Not specified"}</p>
          </div>
          
          <div className="bg-muted/50 rounded p-2 text-center">
            <div className="flex items-center justify-center mb-1">
              <User className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mb-0.5">Assigned</p>
            <p className="font-medium text-foreground text-xs truncate">{equipment.assigned_to || "Unassigned"}</p>
          </div>
          
          <div className="bg-muted/50 rounded p-2 text-center">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mb-0.5">Price</p>
            <p className="font-medium text-foreground text-xs">
              {equipment.price ? `$${equipment.price.toLocaleString()}` : "N/A"}
            </p>
          </div>
        </div>
        
        {/* Footer Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-3 border-t border-border">
          <div className="flex items-center gap-2 min-w-0">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground truncate">
              {equipment.warranty_expiry 
                ? `Service: ${new Date(equipment.warranty_expiry).toLocaleDateString()}`
                : "No service info"
              }
            </span>
          </div>
          
          <Button 
            onClick={handleViewDetails}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8 w-full sm:w-auto"
          >
            <FileText className="h-3 w-3 mr-1.5" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipmentCard;
