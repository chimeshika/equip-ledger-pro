
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EquipmentCard from "./EquipmentCard";

// Mock data for demonstration
const mockEquipments = [
  {
    id: "1",
    itemName: "Dell Laptop XPS 13",
    category: "Computer",
    brand: "Dell",
    serialNumber: "DL001234",
    purchaseDate: "2023-01-15",
    supplier: "Dell Direct",
    price: 1299.99,
    warrantyPeriod: "3 years",
    warrantyExpiry: "2026-01-15",
    location: "Office A - Desk 12",
    assignedTo: "John Smith",
    condition: "Excellent",
    notes: "Primary work laptop"
  },
  {
    id: "2",
    itemName: "iPhone 14 Pro",
    category: "Mobile Device",
    brand: "Apple",
    serialNumber: "APL567890",
    purchaseDate: "2023-03-10",
    supplier: "Apple Store",
    price: 999.99,
    warrantyPeriod: "1 year",
    warrantyExpiry: "2024-03-10",
    location: "Mobile Pool",
    assignedTo: "Sarah Johnson",
    condition: "Good",
    notes: "Company phone for sales team"
  },
  {
    id: "3",
    itemName: "HP Printer LaserJet",
    category: "Printer",
    brand: "HP",
    serialNumber: "HP123456",
    purchaseDate: "2022-11-20",
    supplier: "Office Depot",
    price: 299.99,
    warrantyPeriod: "2 years",
    warrantyExpiry: "2024-11-20",
    location: "Reception Area",
    assignedTo: "Office Manager",
    condition: "Fair",
    notes: "Main office printer, requires maintenance"
  }
];

const Dashboard = () => {
  const totalEquipment = mockEquipments.length;
  const activeEquipment = mockEquipments.filter(eq => eq.condition !== "Out of Service").length;
  const warningEquipment = mockEquipments.filter(eq => {
    const expiryDate = new Date(eq.warrantyExpiry);
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
          <div className="space-y-4">
            {mockEquipments.map((equipment) => (
              <EquipmentCard key={equipment.id} equipment={equipment} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
