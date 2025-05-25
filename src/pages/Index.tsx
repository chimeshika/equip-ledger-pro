
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Dashboard from "@/components/Dashboard";
import AddEquipment from "@/components/AddEquipment";
import RepairDetails from "@/components/RepairDetails";
import SearchEquipment from "@/components/SearchEquipment";
import AdminPortal from "@/components/AdminPortal";
import UserProfile from "@/components/UserProfile";
import { Settings, FileText, Search, Plus, LogOut, Shield, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentUser } from "@/hooks/useProfiles";

const Index = () => {
  const { signOut, user } = useAuth();
  const { data: currentUser } = useCurrentUser();

  const handleSignOut = async () => {
    await signOut();
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Equipment Recorder</h1>
            <p className="text-slate-600">Manage your equipment inventory, repairs, and documentation</p>
            {user && (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-slate-500">Welcome, {user.email}</p>
                {currentUser && (
                  <span className="text-xs bg-slate-200 px-2 py-1 rounded">
                    {currentUser.role === 'admin' ? 'Administrator' : 'User'}
                  </span>
                )}
              </div>
            )}
          </div>
          <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-6' : 'grid-cols-5'} mb-6`}>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Equipment
            </TabsTrigger>
            <TabsTrigger value="repairs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Repairs
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="add">
            <AddEquipment />
          </TabsContent>

          <TabsContent value="repairs">
            <RepairDetails />
          </TabsContent>

          <TabsContent value="search">
            <SearchEquipment />
          </TabsContent>

          <TabsContent value="profile">
            <UserProfile />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin">
              <AdminPortal />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
