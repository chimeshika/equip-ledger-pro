
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "@/components/Dashboard";
import AddEquipment from "@/components/AddEquipment";
import AddRecords from "@/components/AddRecords";
import SearchEquipment from "@/components/SearchEquipment";
import AdminPortal from "@/components/AdminPortal";
import UserProfile from "@/components/UserProfile";
import { useCurrentUser } from "@/hooks/useProfiles";
import { useState } from "react";

const Index = () => {
  const { data: currentUser } = useCurrentUser();
  const isAdmin = currentUser?.role === 'admin';
  const [activeView, setActiveView] = useState("dashboard");

  const renderActiveView = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard />;
      case "add-equipment":
        return <AddEquipment />;
      case "add-records":
        return <AddRecords />;
      case "search":
        return <SearchEquipment />;
      case "admin":
        return isAdmin ? <AdminPortal /> : <Dashboard />;
      case "profile":
        return <UserProfile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar 
          isAdmin={isAdmin} 
          activeView={activeView} 
          onViewChange={setActiveView} 
        />
        <SidebarInset>
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-800 mb-2">Equipment Management System</h1>
              <p className="text-slate-600">Comprehensive equipment tracking and maintenance management</p>
            </div>
            {renderActiveView()}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
