
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2 } from "lucide-react";

interface EquipmentDetailsProps {
  equipment: any;
  onEdit: (equipment: any) => void;
  onDelete: (equipmentId: string) => void;
}

const EquipmentDetails = ({ equipment, onEdit, onDelete }: EquipmentDetailsProps) => {
  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{equipment.item_name}</CardTitle>
            <CardDescription>Serial: {equipment.serial_number}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(equipment)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Equipment</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this equipment? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(equipment.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-slate-500">Brand</p>
            <p className="font-medium">{equipment.brand}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Category</p>
            <p className="font-medium">{equipment.category}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Condition</p>
            <Badge>{equipment.condition}</Badge>
          </div>
          <div>
            <p className="text-sm text-slate-500">Assigned To</p>
            <p className="font-medium">{equipment.assigned_to || "Unassigned"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Location</p>
            <p className="font-medium">{equipment.location || "Not specified"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Price</p>
            <p className="font-medium">${equipment.price || "Not specified"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipmentDetails;
