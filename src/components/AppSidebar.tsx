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
  SidebarTrigger } from
"@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useRepairRequests } from "@/hooks/useRepairRequests";
import {
  LayoutDashboard,
  Plus,
  FileText,
  Search,
  Settings,
  User,
  LogOut,
  X,
  BarChart3,
  Shield,
  Wrench,
  Building2 } from
"lucide-react";

interface AppSidebarProps {
  isAdmin: boolean;
  activeView: string;
  onViewChange: (view: string) => void;
}

const menuItems = [
{
  title: "Dashboard",
  key: "dashboard",
  icon: LayoutDashboard
},
{
  title: "Add Equipment",
  key: "add-equipment",
  icon: Plus
},
{
  title: "Add Records",
  key: "add-records",
  icon: FileText
},
{
  title: "Search",
  key: "search",
  icon: Search
},
{
  title: "Reports",
  key: "reports",
  icon: BarChart3
},
{
  title: "Repairs",
  key: "repairs",
  icon: Wrench
}];


const adminItems = [
{
  title: "Branches",
  key: "branches",
  icon: Building2
},
{
  title: "Admin Portal",
  key: "admin",
  icon: Shield
}];


const userItems = [
{
  title: "Profile",
  key: "profile",
  icon: User
}];


export function AppSidebar({ isAdmin, activeView, onViewChange }: AppSidebarProps) {
  const { signOut } = useAuth();
  const { requests } = useRepairRequests('all');
  const pendingRepairCount = requests.filter((r) => r.status === 'pending').length;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border p-4 bg-sidebar">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-accent rounded flex items-center justify-center">
              <Settings className="h-5 w-5 text-accent-foreground" />
            </div>
            <div className="hidden sm:block">
              <h2 className="text-sm font-semibold text-sidebar-foreground">Equipment Ledger</h2>
              <p className="text-xs text-sidebar-foreground/70">Asset Management</p>
            </div>
          </div>
          
          {/* Close Button for Mobile */}
          <div className="md:hidden">
            <SidebarTrigger className="w-8 h-8 rounded bg-sidebar-accent/30 hover:bg-sidebar-accent text-sidebar-foreground flex items-center justify-center transition-colors">
              <X className="h-4 w-4" />
            </SidebarTrigger>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-4 bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider px-3 mb-2">
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) =>
              <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                  asChild
                  isActive={activeView === item.key}
                  className={`
                      transition-colors duration-150
                      rounded py-2.5 px-3
                      ${activeView === item.key ?
                  'bg-sidebar-accent text-sidebar-foreground font-medium border-l-2 border-accent' :
                  'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'}
                    `
                  }>

                    <button
                    onClick={() => onViewChange(item.key)}
                    className="flex items-center gap-3 w-full text-left">

                      <item.icon className="h-4 w-4" />
                      <span className="text-sm flex-1">{item.title}</span>
                      {item.key === 'repairs' && pendingRepairCount > 0 &&
                    <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-[10px] font-bold">
                          {pendingRepairCount}
                        </Badge>
                    }
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin &&
        <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider px-3 mb-2 mt-4">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {adminItems.map((item) =>
              <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                  asChild
                  isActive={activeView === item.key}
                  className={`
                        transition-colors duration-150
                        rounded py-2.5 px-3
                        ${activeView === item.key ?
                  'bg-sidebar-accent text-sidebar-foreground font-medium border-l-2 border-accent' :
                  'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'}
                      `
                  }>

                      <button
                    onClick={() => onViewChange(item.key)}
                    className="flex items-center gap-3 w-full text-left">

                        <item.icon className="h-4 w-4" />
                        <span className="text-sm">{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
              )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        }

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider px-3 mb-2 mt-4">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {userItems.map((item) =>
              <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                  asChild
                  isActive={activeView === item.key}
                  className={`
                      transition-colors duration-150
                      rounded py-2.5 px-3
                      ${activeView === item.key ?
                  'bg-sidebar-accent text-sidebar-foreground font-medium border-l-2 border-accent' :
                  'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'}
                    `
                  }>

                    <button
                    onClick={() => onViewChange(item.key)}
                    className="flex items-center gap-3 w-full text-left">

                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3 bg-sidebar">
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 border-sidebar-border text-sidebar-foreground/80 hover:text-sidebar-foreground transition-colors py-2 bg-secondary">

          <LogOut className="h-4 w-4" />
          <span className="text-sm font-medium">Sign Out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>);

}