
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
  LogOut 
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
  },
  {
    title: "Add Equipment",
    key: "add-equipment", 
    icon: Plus,
  },
  {
    title: "Add Records",
    key: "add-records",
    icon: FileText,
  },
  {
    title: "Search",
    key: "search",
    icon: Search,
  },
];

const adminItems = [
  {
    title: "Admin Portal",
    key: "admin",
    icon: Settings,
  },
];

const userItems = [
  {
    title: "Profile",
    key: "profile",
    icon: User,
  },
];

export function AppSidebar({ isAdmin, activeView, onViewChange }: AppSidebarProps) {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sidebar className="border-r border-slate-200 bg-white shadow-sm">
      <SidebarHeader className="border-b border-slate-100 p-4 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Settings className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <h2 className="text-lg font-semibold text-slate-800">Equipment Manager</h2>
              <p className="text-xs text-slate-500">Inventory System</p>
            </div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-slate-500 uppercase tracking-wider px-3 mb-2">
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton 
                    asChild
                    isActive={activeView === item.key}
                    className="transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700 data-[active=true]:border-r-2 data-[active=true]:border-blue-500"
                  >
                    <button 
                      onClick={() => onViewChange(item.key)}
                      className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium"
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-slate-500 uppercase tracking-wider px-3 mb-2">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton 
                      asChild
                      isActive={activeView === item.key}
                      className="transition-all duration-200 hover:bg-orange-50 hover:text-orange-700 data-[active=true]:bg-orange-100 data-[active=true]:text-orange-700 data-[active=true]:border-r-2 data-[active=true]:border-orange-500"
                    >
                      <button 
                        onClick={() => onViewChange(item.key)}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium"
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-slate-500 uppercase tracking-wider px-3 mb-2">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {userItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton 
                    asChild
                    isActive={activeView === item.key}
                    className="transition-all duration-200 hover:bg-green-50 hover:text-green-700 data-[active=true]:bg-green-100 data-[active=true]:text-green-700 data-[active=true]:border-r-2 data-[active=true]:border-green-500"
                  >
                    <button 
                      onClick={() => onViewChange(item.key)}
                      className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium"
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-100 p-4 bg-gradient-to-r from-slate-50 to-white">
        <Button 
          variant="outline" 
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
