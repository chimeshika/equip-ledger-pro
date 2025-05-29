
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EquipmentCard from "./EquipmentCard";
import { useEquipment } from "@/hooks/useEquipment";
import { TrendingUp, Package, AlertTriangle, CheckCircle, Activity } from "lucide-react";

const Dashboard = () => {
  const { equipment, isLoading } = useEquipment();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse-soft">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
          <div className="flex justify-center mt-4">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
            </div>
          </div>
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

  const stats = [
    {
      title: "Total Equipment",
      value: totalEquipment,
      subtitle: "Items registered",
      icon: Package,
      gradient: "gradient-info",
      iconBg: "bg-blue-500",
      change: "+12%",
      trend: "up"
    },
    {
      title: "Active Equipment",
      value: activeEquipment,
      subtitle: "In working condition",
      icon: CheckCircle,
      gradient: "gradient-success",
      iconBg: "bg-green-500",
      change: "+8%",
      trend: "up"
    },
    {
      title: "Warranty Alerts",
      value: warningEquipment,
      subtitle: "Expiring within 6 months",
      icon: AlertTriangle,
      gradient: "gradient-warning",
      iconBg: "bg-orange-500",
      change: "-5%",
      trend: "down"
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={stat.title} variant="floating" className={`${stat.gradient} relative overflow-hidden animate-scale-in`} style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-12 -translate-x-12"></div>
            
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 ${stat.iconBg} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-white/90">
                  <TrendingUp className={`h-4 w-4 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                  <span className="text-sm font-semibold">{stat.change}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-white mb-1">{stat.value}</div>
              <p className="text-white/80 text-sm font-medium">{stat.subtitle}</p>
              <h3 className="text-white font-semibold mt-2">{stat.title}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Recent Equipment Section */}
      <Card variant="glass" className="animate-slide-up">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle variant="gradient" className="text-2xl">Recent Equipment</CardTitle>
              <CardDescription className="text-base">Latest registered equipment in your inventory</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {equipment.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 gradient-secondary rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce-in">
                <Package className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No equipment registered yet</h3>
              <p className="text-slate-500 font-medium">Add your first equipment to get started with tracking!</p>
              <div className="mt-6">
                <button className="btn-modern">
                  Add Equipment
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {equipment.slice(0, 5).map((item, index) => (
                <div key={item.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <EquipmentCard equipment={item} />
                </div>
              ))}
              {equipment.length > 5 && (
                <div className="text-center pt-4">
                  <button className="btn-modern">
                    View All Equipment ({equipment.length - 5} more)
                  </button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
