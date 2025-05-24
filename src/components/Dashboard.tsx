
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EquipmentCard from "./EquipmentCard";
import { useEquipment } from "@/hooks/useEquipment";

const Dashboard = () => {
  const { equipment, isLoading } = useEquipment();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const totalEquipment = equipment.length;
  const activeEquipment = equipment.filter(eq => eq.condition !== "Out of Service").length;
  const warningEquipment = equipment.filter(eq => {
    if (!eq.warranty_expiry) return false;
    const expiryDate = new Date(eq.warranty_expiry);
    const now = new Date();
    const monthsUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsUntilExpiry <= 6 && monthsUntilExpiry > 0;
  }).length;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-800">Total Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{totalEquipment}</div>
            <p className="text-blue-600 text-sm">Items registered</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-800">Active Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{activeEquipment}</div>
            <p className="text-green-600 text-sm">In working condition</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-orange-800">Warranty Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{warningEquipment}</div>
            <p className="text-orange-600 text-sm">Expiring within 6 months</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Equipment */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Equipment</CardTitle>
          <CardDescription>Latest registered equipment in your inventory</CardDescription>
        </CardHeader>
        <CardContent>
          {equipment.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600">No equipment registered yet.</p>
              <p className="text-sm text-slate-500 mt-1">Add your first equipment to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {equipment.slice(0, 5).map((item) => (
                <EquipmentCard key={item.id} equipment={item} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
