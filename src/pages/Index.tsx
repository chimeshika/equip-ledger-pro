
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "@/components/Dashboard";
import AddEquipment from "@/components/AddEquipment";
import AddRecords from "@/components/AddRecords";
import SearchEquipment from "@/components/SearchEquipment";
import AdminPortal from "@/components/AdminPortal";
import UserProfile from "@/components/UserProfile";
import Reports from "@/components/Reports";
import { GovernmentHeader } from "@/components/GovernmentHeader";
import { useCurrentUser } from "@/hooks/useProfiles";
import { useState } from "react";
import { Menu, Zap } from "lucide-react";

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
      case "reports":
        return <Reports />;
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
      case "reports":
        return "Reports";
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
      <div className="min-h-screen flex w-full flex-col">
        <GovernmentHeader />
        <div className="flex flex-1 gradient-primary">
          <AppSidebar 
            isAdmin={isAdmin} 
            activeView={activeView} 
            onViewChange={setActiveView} 
          />
          <SidebarInset className="flex-1">
          <div className="flex-1 space-y-6 p-0 md:p-8 md:pt-6">
            {/* Enhanced Mobile Header */}
            <div className="md:hidden">
              {/* Floating Navigation Button */}
              <div className="fixed top-4 left-4 z-50">
                <SidebarTrigger className="
                  w-14 h-14 rounded-2xl 
                  glass shadow-glow
                  border-2 border-white/20
                  transition-all duration-300 ease-out
                  hover:scale-105 active:scale-95
                  flex items-center justify-center
                  backdrop-blur-xl
                  group
                ">
                  <Menu className="h-6 w-6 text-white transition-transform duration-300 group-hover:rotate-90" />
                </SidebarTrigger>
              </div>

              {/* Clean Mobile Header */}
              <div className="mobile-header text-white shadow-float">
                <div className="text-center pt-2 pb-4">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="w-9 h-9 glass rounded-xl flex items-center justify-center shadow-lg">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">{getPageTitle()}</h1>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="status-excellent"></div>
                    <p className="text-white/90 text-sm font-medium">Equipment Management</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Desktop Header */}
            <div className="hidden md:block mb-8 animate-fade-in">
              <div className="glass-card rounded-3xl p-8 shadow-float hover-lift">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 gradient-primary rounded-3xl flex items-center justify-center shadow-glow animate-float">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="heading-modern text-4xl mb-2">Equipment Management System</h1>
                    <p className="subtitle-modern text-lg">Comprehensive inventory tracking and management</p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="status-excellent"></div>
                        <span className="text-sm font-medium text-slate-600">System Active</span>
                      </div>
                      <div className="w-px h-4 bg-slate-300"></div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-600">Full Access</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="animate-slide-up pt-4 md:pt-0">
              <div className="glass-card rounded-3xl p-4 md:p-8 shadow-float min-h-[60vh]">
                {renderActiveView()}
              </div>
            </div>
          </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
