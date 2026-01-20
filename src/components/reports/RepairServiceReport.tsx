import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { formatLKR } from "@/lib/currency";

const RepairServiceReport = () => {
  const { toast } = useToast();

  const { data: repairData } = useQuery({
    queryKey: ["repair-service-report"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("repairs")
        .select(`
          repair_date,
          repair_cost,
          description,
          equipment:equipment_id (
            serial_number,
            item_name
          )
        `)
        .order("repair_date", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const exportToPDF = () => {
    if (!repairData || repairData.length === 0) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }

    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.text("Payment for Repair & Service Agreement", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("(R-Repair, S-Service Agreement)", doc.internal.pageSize.getWidth() / 2, 28, { align: "center" });
    
    doc.setFontSize(10);
    let yPos = 45;
    
    // Headers
    doc.setFont(undefined, "bold");
    const headers = ["S/No", "Voucher No", "Date", "Description", "Amount (Rs.)", "Staff Officer's Signature & Date"];
    const colWidth = (doc.internal.pageSize.getWidth() - 20) / headers.length;
    headers.forEach((header, i) => {
      doc.text(header, 10 + i * colWidth, yPos);
    });

    // Data
    doc.setFont(undefined, "normal");
    yPos += 10;
    repairData.forEach((row: any, index) => {
      doc.text(String(index + 1), 10, yPos);
      doc.text(row.equipment?.serial_number || "-", 10 + colWidth, yPos);
      doc.text(row.repair_date || "-", 10 + colWidth * 2, yPos);
      doc.text(row.description || "-", 10 + colWidth * 3, yPos);
      doc.text(row.repair_cost ? formatLKR(row.repair_cost, false) : "-", 10 + colWidth * 4, yPos);
      doc.text("", 10 + colWidth * 5, yPos);
      yPos += 7;
      
      if (yPos > 180) {
        doc.addPage();
        yPos = 20;
      }
    });

    doc.save("repair-service-report.pdf");
    toast({ title: "PDF exported successfully" });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Payment for Repair & Service Agreement</CardTitle>
            <p className="text-sm text-muted-foreground">(R-Repair, S-Service Agreement)</p>
          </div>
          <Button onClick={exportToPDF} variant="outline" size="sm">
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S/No</TableHead>
                <TableHead>Voucher No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount (Rs.)</TableHead>
                <TableHead>Staff Officer's Signature & Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repairData?.map((repair: any, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{repair.equipment?.serial_number}</TableCell>
                  <TableCell>{repair.repair_date}</TableCell>
                  <TableCell>{repair.description}</TableCell>
                  <TableCell>{repair.repair_cost ? formatLKR(repair.repair_cost) : "-"}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RepairServiceReport;
