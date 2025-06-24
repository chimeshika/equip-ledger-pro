
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
      bgColor: "bg-solid-blue",
      iconBg: "bg-blue-600",
      change: "+12%",
      trend: "up"
    },
    {
      title: "Active Equipment",
      value: activeEquipment,
      subtitle: "In working condition",
      icon: CheckCircle,
      bgColor: "bg-solid-green",
      iconBg: "bg-green-600",
      change: "+8%",
      trend: "up"
    },
    {
      title: "Service Alerts",
      value: warningEquipment,
      subtitle: "Expiring within 6 months",
      icon: AlertTriangle,
      bgColor: "bg-solid-orange",
      iconBg: "bg-orange-600",
      change: "-5%",
      trend: "down"
    }
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Enhanced Statistics Cards - Mobile Optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <Card key={stat.title} variant="floating" className={`${stat.bgColor} relative overflow-hidden animate-scale-in`} style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/10 -translate-y-12 md:-translate-y-16 translate-x-12 md:translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 md:w-24 md:h-24 rounded-full bg-white/5 translate-y-8 md:translate-y-12 -translate-x-8 md:-translate-x-12"></div>
            
            <CardHeader className="pb-2 md:pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.iconBg} rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg`}>
                  <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-white/90">
                  <TrendingUp className={`h-3 w-3 md:h-4 md:w-4 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                  <span className="text-xs md:text-sm font-semibold">{stat.change}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-0">
              <div className="text-2xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
              <p className="text-white/90 text-xs md:text-sm font-medium">{stat.subtitle}</p>
              <h3 className="text-white font-semibold mt-1 md:mt-2 text-sm md:text-base">{stat.title}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Recent Equipment Section - Mobile Optimized */}
      <Card variant="glass" className="animate-slide-up">
        <CardHeader className="pb-4 md:pb-6">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 gradient-primary rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div>
              <CardTitle variant="gradient" className="text-lg md:text-2xl">Recent Equipment</CardTitle>
              <CardDescription className="text-sm md:text-base">Latest registered equipment in your inventory</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {equipment.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-solid-blue rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-6 animate-bounce-in">
                <Package className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-slate-700 mb-2">No equipment registered yet</h3>
              <p className="text-slate-500 font-medium text-sm md:text-base">Add your first equipment to get started with tracking!</p>
              <div className="mt-4 md:mt-6">
                <button className="btn-modern text-sm md:text-base px-4 md:px-6 py-2 md:py-3">
                  Add Equipment
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {equipment.slice(0, 5).map((item, index) => (
                <div key={item.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <EquipmentCard equipment={item} />
                </div>
              ))}
              {equipment.length > 5 && (
                <div className="text-center pt-4">
                  <button className="btn-modern text-sm md:text-base px-4 md:px-6 py-2 md:py-3">
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
