
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Dashboard from "@/components/Dashboard";
import AddEquipment from "@/components/AddEquipment";
import RepairDetails from "@/components/RepairDetails";
import SearchEquipment from "@/components/SearchEquipment";
import { Settings, FileText, Search, Plus } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Equipment Recorder</h1>
          <p className="text-slate-600">Manage your equipment inventory, repairs, and documentation</p>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
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
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
