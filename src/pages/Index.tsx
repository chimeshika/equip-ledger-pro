
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
      <div className="min-h-screen flex w-full gradient-primary">
        <AppSidebar 
          isAdmin={isAdmin} 
          activeView={activeView} 
          onViewChange={setActiveView} 
        />
        <SidebarInset className="flex-1">
          <div className="flex-1 space-y-6 p-0 md:p-8 md:pt-6">
            {/* Ultra-Modern Eye-Catching Mobile Header */}
            <div className="md:hidden">
              {/* Revolutionary Floating Hamburger Menu */}
              <div className="fixed top-6 left-4 z-50">
                <SidebarTrigger className="
                  w-16 h-16 rounded-3xl 
                  glass shadow-glow
                  border-2 border-white/30
                  transition-all duration-500 ease-out
                  hover:scale-110 active:scale-95
                  animate-pulse-soft hover:animate-none
                  flex items-center justify-center
                  backdrop-blur-xl
                  group
                ">
                  <Menu className="h-7 w-7 text-white transition-transform duration-300 group-hover:rotate-180" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 gradient-warning rounded-full animate-bounce"></div>
                </SidebarTrigger>
              </div>

              {/* Stunning Mobile Header with Glass Morphism */}
              <div className="mobile-header text-white shadow-float">
                <div className="text-center pt-4">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="w-10 h-10 glass rounded-2xl flex items-center justify-center shadow-lg animate-rotate-in">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">{getPageTitle()}</h1>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="status-excellent"></div>
                    <p className="text-white/90 text-sm font-medium tracking-wide">Equipment Management Pro</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Desktop Header */}
            <div className="hidden md:block mb-8 animate-fade-in">
              <div className="glass-card rounded-3xl p-8 shadow-float hover-lift">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 gradient-primary rounded-3xl flex items-center justify-center shadow-glow animate-float">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="heading-modern text-4xl mb-2">Equipment Management System</h1>
                    <p className="subtitle-modern text-lg">Advanced inventory tracking with intelligent insights</p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="status-excellent"></div>
                        <span className="text-sm font-medium text-slate-600">System Online</span>
                      </div>
                      <div className="w-px h-4 bg-slate-300"></div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-600">Pro Version</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area with Enhanced Styling */}
            <div className="animate-slide-up pt-4 md:pt-0">
              <div className="glass-card rounded-3xl p-6 md:p-8 shadow-float min-h-[60vh]">
                {renderActiveView()}
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
