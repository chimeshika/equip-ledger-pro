import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { formatLKR } from "@/lib/currency";

const PurchaseAccessoriesReport = () => {
  const { toast } = useToast();

  const { data: equipmentData } = useQuery({
    queryKey: ["purchase-accessories-report"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment")
        .select("serial_number, purchase_date, price, item_name")
        .order("purchase_date", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const exportToPDF = () => {
    if (!equipmentData || equipmentData.length === 0) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }

    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.text("Purchase of New Accessories for the Computer", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });
    
    doc.setFontSize(10);
    let yPos = 40;
    
    // Headers
    doc.setFont(undefined, "bold");
    const headers = ["S/No", "Voucher No", "Date", "R/S", "Description", "Amount (Rs.)", "Staff Officer's Signature & Date"];
    const colWidth = (doc.internal.pageSize.getWidth() - 20) / headers.length;
    headers.forEach((header, i) => {
      doc.text(header, 10 + i * colWidth, yPos);
    });

    // Data
    doc.setFont(undefined, "normal");
    yPos += 10;
    equipmentData.forEach((row, index) => {
      doc.text(String(index + 1), 10, yPos);
      doc.text(row.serial_number || "-", 10 + colWidth, yPos);
      doc.text(row.purchase_date || "-", 10 + colWidth * 2, yPos);
      doc.text("-", 10 + colWidth * 3, yPos);
      doc.text(row.item_name || "-", 10 + colWidth * 4, yPos);
      doc.text(row.price ? formatLKR(row.price, false) : "-", 10 + colWidth * 5, yPos);
      doc.text("", 10 + colWidth * 6, yPos);
      yPos += 7;
      
      if (yPos > 180) {
        doc.addPage();
        yPos = 20;
      }
    });

    doc.save("purchase-accessories-report.pdf");
    toast({ title: "PDF exported successfully" });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Purchase of New Accessories for the Computer</CardTitle>
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
                <TableHead>R/S</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount (Rs.)</TableHead>
                <TableHead>Staff Officer's Signature & Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipmentData?.map((item, index) => (
                <TableRow key={item.serial_number}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.serial_number}</TableCell>
                  <TableCell>{item.purchase_date}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>{item.item_name}</TableCell>
                  <TableCell>{item.price ? formatLKR(item.price) : "-"}</TableCell>
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

export default PurchaseAccessoriesReport;
