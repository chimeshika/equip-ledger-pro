
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "@/components/Dashboard";
import AddEquipment from "@/components/AddEquipment";
import AddRecords from "@/components/AddRecords";
import SearchEquipment from "@/components/SearchEquipment";
import AdminPortal from "@/components/AdminPortal";
import UserProfile from "@/components/UserProfile";
import { useCurrentUser } from "@/hooks/useProfiles";
import { useState } from "react";
import { Menu } from "lucide-react";

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

  const getPageTitle = () => {
    switch (activeView) {
      case "dashboard":
        return "Dashboard";
      case "add-equipment":
        return "Add Equipment";
      case "add-records":
        return "Add Records";
      case "search":
        return "Search Equipment";
      case "admin":
        return "Admin Portal";
      case "profile":
        return "Profile";
      default:
        return "Dashboard";
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50">
        <AppSidebar 
          isAdmin={isAdmin} 
          activeView={activeView} 
          onViewChange={setActiveView} 
        />
        <SidebarInset className="flex-1">
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            {/* Enhanced Mobile Header with Clear Navigation */}
            <div className="md:hidden flex items-center gap-4 mb-6 bg-white p-4 rounded-xl shadow-lg border border-slate-200">
              <div className="flex items-center justify-center">
                <SidebarTrigger className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors">
                  <Menu className="h-5 w-5 text-blue-700" />
                </SidebarTrigger>
              </div>
              <div className="flex-1">
                <h1 className="text-lg font-semibold text-slate-800">{getPageTitle()}</h1>
                <p className="text-sm text-slate-500">Tap menu to navigate</p>
              </div>
              <div className="text-xs text-slate-400 px-2 py-1 bg-slate-100 rounded-full">
                ☰ Menu
              </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:block mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Menu className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-slate-800 mb-2">Equipment Management System</h1>
                  <p className="text-slate-600">Comprehensive equipment tracking and maintenance management</p>
                </div>
              </div>
            </div>

            <div className="animate-fade-in">
              {renderActiveView()}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
