
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  Plus, 
  FileText, 
  Search, 
  Settings, 
  User,
  LogOut,
  X,
  BarChart3
} from "lucide-react";

interface AppSidebarProps {
  isAdmin: boolean;
  activeView: string;
  onViewChange: (view: string) => void;
}

const menuItems = [
  {
    title: "Dashboard",
    key: "dashboard",
    icon: LayoutDashboard,
    color: "blue",
  },
  {
    title: "Add Equipment",
    key: "add-equipment", 
    icon: Plus,
    color: "green",
  },
  {
    title: "Add Records",
    key: "add-records",
    icon: FileText,
    color: "orange",
  },
  {
    title: "Search",
    key: "search",
    icon: Search,
    color: "purple",
  },
  {
    title: "Reports",
    key: "reports",
    icon: BarChart3,
    color: "blue",
  },
];

const adminItems = [
  {
    title: "Admin Portal",
    key: "admin",
    icon: Settings,
    color: "red",
  },
];

const userItems = [
  {
    title: "Profile",
    key: "profile",
    icon: User,
    color: "indigo",
  },
];

export function AppSidebar({ isAdmin, activeView, onViewChange }: AppSidebarProps) {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      blue: isActive 
        ? "bg-blue-100 text-blue-700 border-r-4 border-blue-500" 
        : "hover:bg-blue-50 hover:text-blue-700",
      green: isActive 
        ? "bg-green-100 text-green-700 border-r-4 border-green-500" 
        : "hover:bg-green-50 hover:text-green-700",
      orange: isActive 
        ? "bg-orange-100 text-orange-700 border-r-4 border-orange-500" 
        : "hover:bg-orange-50 hover:text-orange-700",
      purple: isActive 
        ? "bg-purple-100 text-purple-700 border-r-4 border-purple-500" 
        : "hover:bg-purple-50 hover:text-purple-700",
      red: isActive 
        ? "bg-red-100 text-red-700 border-r-4 border-red-500" 
        : "hover:bg-red-50 hover:text-red-700",
      indigo: isActive 
        ? "bg-indigo-100 text-indigo-700 border-r-4 border-indigo-500" 
        : "hover:bg-indigo-50 hover:text-indigo-700",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <Sidebar className="
      border-r border-white/20 
      bg-white/95 backdrop-blur-xl
      shadow-2xl
      data-[state=open]:animate-slide-in
    ">
      <SidebarHeader className="
        border-b border-gradient-to-r from-blue-100/50 to-purple-100/50 
        p-6 
        bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20
        backdrop-blur-lg
      ">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h2 className="text-lg font-bold text-slate-800">EquipLedger</h2>
              <p className="text-xs text-slate-500 font-medium">Pro Inventory</p>
            </div>
          </div>
          
          {/* Modern Close Button for Mobile */}
          <div className="md:hidden">
            <SidebarTrigger className="
              w-10 h-10 rounded-xl 
              bg-slate-100 hover:bg-slate-200
              border-0 text-slate-600
              transition-all duration-200
              hover:scale-105 active:scale-95
              flex items-center justify-center
            ">
              <X className="h-5 w-5" />
            </SidebarTrigger>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-6 bg-gradient-to-b from-transparent to-slate-50/30">
        <SidebarGroup>
          <SidebarGroupLabel className="
            text-xs font-semibold text-slate-500 uppercase tracking-wider 
            px-3 mb-4 flex items-center gap-2
          ">
            <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton 
                    asChild
                    isActive={activeView === item.key}
                    className={`
                      transition-all duration-300 ease-out
                      ${getColorClasses(item.color, activeView === item.key)}
                      rounded-xl py-3 px-4 min-h-[48px]
                      transform hover:scale-[1.02] active:scale-[0.98]
                      backdrop-blur-sm
                      ${activeView === item.key ? 'shadow-lg' : 'hover:shadow-md'}
                    `}
                  >
                    <button 
                      onClick={() => onViewChange(item.key)}
                      className="flex items-center gap-4 w-full text-left"
                    >
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center
                        ${activeView === item.key 
                          ? `bg-${item.color}-500 text-white shadow-lg` 
                          : `bg-${item.color}-100 text-${item.color}-600`
                        }
                        transition-all duration-300
                      `}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium truncate">{item.title}</span>
                      {activeView === item.key && (
                        <div className="ml-auto w-2 h-2 bg-current rounded-full animate-pulse"></div>
                      )}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="
              text-xs font-semibold text-slate-500 uppercase tracking-wider 
              px-3 mb-4 mt-6 flex items-center gap-2
            ">
              <div className="w-1 h-4 bg-gradient-to-b from-orange-500 to-red-600 rounded-full"></div>
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton 
                      asChild
                      isActive={activeView === item.key}
                      className={`
                        transition-all duration-300 ease-out
                        ${getColorClasses(item.color, activeView === item.key)}
                        rounded-xl py-3 px-4 min-h-[48px]
                        transform hover:scale-[1.02] active:scale-[0.98]
                        backdrop-blur-sm
                        ${activeView === item.key ? 'shadow-lg' : 'hover:shadow-md'}
                      `}
                    >
                      <button 
                        onClick={() => onViewChange(item.key)}
                        className="flex items-center gap-4 w-full text-left"
                      >
                        <div className={`
                          w-8 h-8 rounded-lg flex items-center justify-center
                          ${activeView === item.key 
                            ? `bg-${item.color}-500 text-white shadow-lg` 
                            : `bg-${item.color}-100 text-${item.color}-600`
                          }
                          transition-all duration-300
                        `}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium truncate">{item.title}</span>
                        {activeView === item.key && (
                          <div className="ml-auto w-2 h-2 bg-current rounded-full animate-pulse"></div>
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="
            text-xs font-semibold text-slate-500 uppercase tracking-wider 
            px-3 mb-4 mt-6 flex items-center gap-2
          ">
            <div className="w-1 h-4 bg-gradient-to-b from-green-500 to-teal-600 rounded-full"></div>
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {userItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton 
                    asChild
                    isActive={activeView === item.key}
                    className={`
                      transition-all duration-300 ease-out
                      ${getColorClasses(item.color, activeView === item.key)}
                      rounded-xl py-3 px-4 min-h-[48px]
                      transform hover:scale-[1.02] active:scale-[0.98]
                      backdrop-blur-sm
                      ${activeView === item.key ? 'shadow-lg' : 'hover:shadow-md'}
                    `}
                  >
                    <button 
                      onClick={() => onViewChange(item.key)}
                      className="flex items-center gap-4 w-full text-left"
                    >
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center
                        ${activeView === item.key 
                          ? `bg-${item.color}-500 text-white shadow-lg` 
                          : `bg-${item.color}-100 text-${item.color}-600`
                        }
                        transition-all duration-300
                      `}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium truncate">{item.title}</span>
                      {activeView === item.key && (
                        <div className="ml-auto w-2 h-2 bg-current rounded-full animate-pulse"></div>
                      )}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="
        border-t border-gradient-to-r from-slate-100/50 to-slate-200/50 
        p-4 
        bg-gradient-to-br from-slate-50/80 to-slate-100/60
        backdrop-blur-lg
      ">
        <Button 
          variant="outline" 
          onClick={handleSignOut}
          className="
            w-full flex items-center gap-3 
            border-red-200 text-red-600
            hover:bg-red-50 hover:text-red-700 hover:border-red-300 
            transition-all duration-300 ease-out
            hover:scale-105 active:scale-95
            min-h-[48px] rounded-xl
            shadow-sm hover:shadow-md
            backdrop-blur-sm
          "
        >
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <LogOut className="h-4 w-4" />
          </div>
          <span className="font-medium">Sign Out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
