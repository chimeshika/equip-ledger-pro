
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import { useEquipmentBySerial } from "@/hooks/useEquipment";

interface EquipmentSearchProps {
  onEquipmentFound: (equipment: any) => void;
  isSearching: boolean;
}

const EquipmentSearch = ({ onEquipmentFound, isSearching }: EquipmentSearchProps) => {
  const { toast } = useToast();
  const [searchSerial, setSearchSerial] = useState("");
  const [activeSearchSerial, setActiveSearchSerial] = useState("");

  const { data: selectedEquipment } = useEquipmentBySerial(activeSearchSerial);

  const handleSearch = () => {
    if (!searchSerial.trim()) {
      toast({
        title: "Search Error",
        description: "Please enter a serial number",
        variant: "destructive"
      });
      return;
    }
    setActiveSearchSerial(searchSerial.trim());
  };

  // Notify parent component when equipment is found
  if (selectedEquipment && selectedEquipment !== onEquipmentFound) {
    onEquipmentFound(selectedEquipment);
  }

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Label htmlFor="searchSerial">Serial Number</Label>
          <Input
            id="searchSerial"
            value={searchSerial}
            onChange={(e) => setSearchSerial(e.target.value)}
            placeholder="Enter serial number to manage"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="flex items-end">
          <Button onClick={handleSearch} disabled={isSearching}>
            <Search className="h-4 w-4 mr-2" />
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      {activeSearchSerial && !selectedEquipment && !isSearching && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">No equipment found with serial number: {activeSearchSerial}</p>
        </div>
      )}
    </div>
  );
};

export default EquipmentSearch;
