
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
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
        <AppSidebar 
          isAdmin={isAdmin} 
          activeView={activeView} 
          onViewChange={setActiveView} 
        />
        <SidebarInset className="flex-1">
          <div className="flex-1 space-y-4 p-0 md:p-8 md:pt-6">
            {/* Enhanced Eye-Catching Mobile Header */}
            <div className="md:hidden">
              {/* Floating Action Button Style Hamburger Menu */}
              <div className="fixed top-4 left-4 z-50">
                <SidebarTrigger className="
                  w-14 h-14 rounded-2xl 
                  bg-gradient-to-br from-blue-600 to-purple-700 
                  hover:from-blue-700 hover:to-purple-800
                  shadow-xl hover:shadow-2xl
                  border-0 text-white
                  transition-all duration-300 ease-out
                  hover:scale-110 active:scale-95
                  animate-pulse hover:animate-none
                  backdrop-blur-sm
                  flex items-center justify-center
                ">
                  <Menu className="h-6 w-6" />
                </SidebarTrigger>
              </div>

              {/* Modern Mobile Header Bar */}
              <div className="
                bg-gradient-to-r from-blue-600/95 via-purple-600/95 to-indigo-600/95 
                backdrop-blur-lg 
                px-20 py-6 
                shadow-lg
                border-b border-white/20
              ">
                <div className="text-center">
                  <h1 className="text-xl font-bold text-white mb-1">{getPageTitle()}</h1>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <p className="text-blue-100 text-sm">Equipment Management</p>
                  </div>
                </div>
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

            <div className="animate-fade-in pt-4 md:pt-0">
              {renderActiveView()}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
