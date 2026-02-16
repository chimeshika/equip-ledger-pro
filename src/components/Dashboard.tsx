import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EquipmentCard from "./EquipmentCard";
import { useEquipment } from "@/hooks/useEquipment";
import { useBranches, useUserBranchAssignment } from "@/hooks/useBranches";
import { useCurrentUser } from "@/hooks/useProfiles";
import { TrendingUp, TrendingDown, Package, AlertTriangle, CheckCircle, Activity, Building2 } from "lucide-react";
import { useState } from "react";

const Dashboard = () => {
  const { equipment, isLoading } = useEquipment();
  const { branches } = useBranches();
  const { data: currentUser } = useCurrentUser();
  const { assignment } = useUserBranchAssignment();
  const [selectedBranchId, setSelectedBranchId] = useState<string>("all");

  const isAdmin = currentUser?.role === 'admin';
  const isItUnit = currentUser?.role === 'it_unit';
  const canFilterBranch = isAdmin || isItUnit;

  // Get user's branch name for display
  const userBranch = branches.find(b => b.id === assignment?.branch_id);

  // Filter equipment by selected branch (admins/IT) or show all (RLS handles filtering for others)
  const filteredEquipment = canFilterBranch && selectedBranchId !== "all"
    ? equipment.filter(eq => eq.branch_id === selectedBranchId)
    : equipment;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-14 h-14 bg-primary rounded flex items-center justify-center mx-auto mb-4">
            <Activity className="h-6 w-6 text-primary-foreground animate-pulse" />
          </div>
          <p className="text-muted-foreground font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const totalEquipment = filteredEquipment.length;
  const activeEquipment = filteredEquipment.filter(eq => eq.condition !== "Out of Service").length;
  const warningEquipment = filteredEquipment.filter(eq => {
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
      bgColor: "bg-secondary",
      change: "+12%",
      trend: "up"
    },
    {
      title: "Active Equipment",
      value: activeEquipment,
      subtitle: "In working condition",
      icon: CheckCircle,
      bgColor: "bg-gov-success",
      change: "+8%",
      trend: "up"
    },
    {
      title: "Service Alerts",
      value: warningEquipment,
      subtitle: "Expiring within 6 months",
      icon: AlertTriangle,
      bgColor: "bg-gov-warning",
      change: "-5%",
      trend: "down"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Branch Filter / Indicator */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="h-5 w-5" />
          {canFilterBranch ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Branch:</span>
              <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                <SelectTrigger className="w-[200px] h-9">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.filter(b => b.is_active).map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} ({branch.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <span className="text-sm font-medium">
              {userBranch ? `${userBranch.name} (${userBranch.code})` : 'No branch assigned'}
            </span>
          )}
        </div>
        {canFilterBranch && selectedBranchId !== "all" && (
          <Badge variant="secondary" className="text-xs">
            Filtered
          </Badge>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card 
            key={stat.title} 
            className={`${stat.bgColor} text-white border-0 shadow-gov-md animate-scale-in`} 
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 bg-white/20 rounded flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex items-center gap-1 text-white/90 text-sm">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="font-medium">{stat.change}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <p className="text-white/80 text-sm">{stat.subtitle}</p>
              <h3 className="text-white font-semibold mt-2 text-sm">{stat.title}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Equipment Section */}
      <Card className="shadow-gov-md border border-border">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">Recent Equipment</CardTitle>
              <CardDescription>Latest registered equipment in your inventory</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {filteredEquipment.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 bg-muted rounded flex items-center justify-center mx-auto mb-4">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">No equipment registered</h3>
              <p className="text-muted-foreground text-sm">Add your first equipment to get started</p>
              <div className="mt-4">
                <button className="btn-gov-primary text-sm">
                  Add Equipment
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEquipment.slice(0, 5).map((item, index) => (
                <div key={item.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  <EquipmentCard equipment={item} />
                </div>
              ))}
              {filteredEquipment.length > 5 && (
                <div className="text-center pt-3 border-t border-border">
                  <button className="btn-gov-outline text-sm">
                    View All Equipment ({filteredEquipment.length - 5} more)
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
