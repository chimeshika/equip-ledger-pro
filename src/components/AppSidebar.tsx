
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
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <h2 className="text-lg font-semibold">Equipment Manager</h2>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton 
                    asChild
                    isActive={activeView === item.key}
                  >
                    <button 
                      onClick={() => onViewChange(item.key)}
                      className="flex items-center gap-2 w-full"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton 
                      asChild
                      isActive={activeView === item.key}
                    >
                      <button 
                        onClick={() => onViewChange(item.key)}
                        className="flex items-center gap-2 w-full"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton 
                    asChild
                    isActive={activeView === item.key}
                  >
                    <button 
                      onClick={() => onViewChange(item.key)}
                      className="flex items-center gap-2 w-full"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <Button 
          variant="outline" 
          onClick={handleSignOut}
          className="w-full flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
