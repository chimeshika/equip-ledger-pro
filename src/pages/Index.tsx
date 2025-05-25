
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Dashboard from "@/components/Dashboard";
import AddEquipment from "@/components/AddEquipment";
import RepairDetails from "@/components/RepairDetails";
import SearchEquipment from "@/components/SearchEquipment";
import AdminPortal from "@/components/AdminPortal";
import UserProfile from "@/components/UserProfile";
import { Settings, FileText, Search, Plus, LogOut, Shield, User, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentUser } from "@/hooks/useProfiles";

const Index = () => {
  const { signOut, user } = useAuth();
  const { data: currentUser } = useCurrentUser();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const isAdmin = currentUser?.role === 'admin';

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Settings },
    { id: "add", label: "Add Equipment", icon: Plus },
    { id: "repairs", label: "Repairs", icon: FileText },
    { id: "search", label: "Search", icon: Search },
    { id: "profile", label: "Profile", icon: User },
    ...(isAdmin ? [{ id: "admin", label: "Admin", icon: Shield }] : []),
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "add":
        return <AddEquipment />;
      case "repairs":
        return <RepairDetails />;
      case "search":
        return <SearchEquipment />;
      case "profile":
        return <UserProfile />;
      case "admin":
        return isAdmin ? <AdminPortal /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-slate-800">Equipment Recorder</h2>
        <p className="text-sm text-slate-600 mt-1">Manage your inventory</p>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 hover:bg-slate-100 ${
                  activeTab === item.id 
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500 shadow-sm" 
                    : "text-slate-700 hover:text-slate-900"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      
      <div className="p-4 border-t">
        {user && (
          <div className="mb-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">Signed in as</p>
            <p className="font-medium text-slate-800 truncate">{user.email}</p>
            {currentUser && (
              <span className="inline-block mt-1 text-xs bg-slate-200 px-2 py-1 rounded">
                {currentUser.role === 'admin' ? 'Administrator' : 'User'}
              </span>
            )}
          </div>
        )}
        <Button 
          variant="outline" 
          onClick={handleSignOut} 
          className="w-full flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          
          <h1 className="text-lg font-bold text-slate-800">
            {menuItems.find(item => item.id === activeTab)?.label || "Dashboard"}
          </h1>
          
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-80 bg-white shadow-lg border-r min-h-screen">
          <SidebarContent />
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:p-6 p-4">
          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-slate-800 mb-2">
                  {menuItems.find(item => item.id === activeTab)?.label || "Dashboard"}
                </h1>
                <p className="text-slate-600">Manage your equipment inventory, repairs, and documentation</p>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="animate-fade-in">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
