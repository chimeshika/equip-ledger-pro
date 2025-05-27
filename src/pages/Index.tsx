
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Dashboard from "@/components/Dashboard";
import AddEquipment from "@/components/AddEquipment";
import AddRecords from "@/components/AddRecords";
import SearchEquipment from "@/components/SearchEquipment";
import AdminPortal from "@/components/AdminPortal";
import UserProfile from "@/components/UserProfile";
import { useCurrentUser } from "@/hooks/useProfiles";

const Index = () => {
  const { data: currentUser } = useCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Equipment Management System</h1>
          <p className="text-slate-600">Comprehensive equipment tracking and maintenance management</p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-fit">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="add-equipment">Add Equipment</TabsTrigger>
            <TabsTrigger value="add-records">Add Records</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
            {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="add-equipment">
            <AddEquipment />
          </TabsContent>

          <TabsContent value="add-records">
            <AddRecords />
          </TabsContent>

          <TabsContent value="search">
            <SearchEquipment />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin">
              <AdminPortal />
            </TabsContent>
          )}

          <TabsContent value="profile">
            <UserProfile />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
