import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FileDown, FileSpreadsheet, FileText, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { Document, Packer, Paragraph, Table as DocxTable, TableCell as DocxTableCell, TableRow as DocxTableRow, WidthType, TextRun } from "docx";

interface FieldDefinition {
  key: string;
  label: string;
  table: string;
}

const AVAILABLE_FIELDS: FieldDefinition[] = [
  // Equipment fields
  { key: "equipment.item_name", label: "Equipment Name", table: "equipment" },
  { key: "equipment.category", label: "Category", table: "equipment" },
  { key: "equipment.brand", label: "Brand", table: "equipment" },
  { key: "equipment.serial_number", label: "Serial Number", table: "equipment" },
  { key: "equipment.condition", label: "Condition", table: "equipment" },
  { key: "equipment.location", label: "Location", table: "equipment" },
  { key: "equipment.assigned_to", label: "Assigned To", table: "equipment" },
  { key: "equipment.supplier", label: "Supplier", table: "equipment" },
  { key: "equipment.price", label: "Price", table: "equipment" },
  { key: "equipment.purchase_date", label: "Purchase Date", table: "equipment" },
  { key: "equipment.warranty_period", label: "Warranty Period", table: "equipment" },
  { key: "equipment.warranty_expiry", label: "Warranty Expiry", table: "equipment" },
  { key: "equipment.notes", label: "Equipment Notes", table: "equipment" },
  
  // Repair fields
  { key: "repairs.repair_date", label: "Repair Date", table: "repairs" },
  { key: "repairs.repair_cost", label: "Repair Cost", table: "repairs" },
  { key: "repairs.description", label: "Repair Description", table: "repairs" },
  { key: "repairs.notes", label: "Repair Notes", table: "repairs" },
  
  // Profile fields
  { key: "profiles.full_name", label: "Owner Name", table: "profiles" },
  { key: "profiles.email", label: "Owner Email", table: "profiles" },
  { key: "profiles.phone", label: "Owner Phone", table: "profiles" },
];

const Reports = () => {
  const [selectedFields, setSelectedFields] = useState<string[]>([
    "equipment.item_name",
    "equipment.serial_number",
    "equipment.category",
  ]);
  const { toast } = useToast();

  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ["report-data", selectedFields],
    queryFn: async () => {
      if (selectedFields.length === 0) return [];

      // Build the query based on selected fields
      let query = supabase
        .from("equipment")
        .select(`
          id,
          item_name,
          category,
          brand,
          serial_number,
          condition,
          location,
          assigned_to,
          supplier,
          price,
          purchase_date,
          warranty_period,
          warranty_expiry,
          notes,
          repairs (
            repair_date,
            repair_cost,
            description,
            notes
          ),
          profiles!equipment_created_by_fkey (
            full_name,
            email,
            phone
          )
        `);

      const { data, error } = await query;

      if (error) throw error;

      // Flatten the data for reporting
      const flattenedData = data?.flatMap((equipment) => {
        if (equipment.repairs && equipment.repairs.length > 0) {
          return equipment.repairs.map((repair: any) => ({
            ...equipment,
            ...repair,
            profiles: equipment.profiles,
          }));
        }
        return [{ ...equipment, profiles: equipment.profiles }];
      }) || [];

      return flattenedData;
    },
    enabled: selectedFields.length > 0,
  });

  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldKey)
        ? prev.filter((f) => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const getFieldValue = (row: any, fieldKey: string): string => {
    const [table, field] = fieldKey.split(".");
    
    if (table === "equipment") {
      return row[field] !== null && row[field] !== undefined ? String(row[field]) : "-";
    } else if (table === "repairs") {
      return row[field] !== null && row[field] !== undefined ? String(row[field]) : "-";
    } else if (table === "profiles" && row.profiles) {
      return row.profiles[field] || "-";
    }
    
    return "-";
  };

  const exportToPDF = () => {
    if (!reportData || reportData.length === 0) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }

    const doc = new jsPDF({ orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(18);
    doc.text("Equipment Report", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(10);
    let yPos = 35;
    const colWidth = (pageWidth - 20) / selectedFields.length;

    // Headers
    doc.setFont(undefined, "bold");
    selectedFields.forEach((fieldKey, index) => {
      const field = AVAILABLE_FIELDS.find((f) => f.key === fieldKey);
      doc.text(field?.label || fieldKey, 10 + index * colWidth, yPos);
    });

    // Data
    doc.setFont(undefined, "normal");
    yPos += 10;
    reportData.slice(0, 50).forEach((row) => {
      selectedFields.forEach((fieldKey, index) => {
        const value = getFieldValue(row, fieldKey);
        doc.text(String(value).substring(0, 30), 10 + index * colWidth, yPos);
      });
      yPos += 7;
      
      if (yPos > 180) {
        doc.addPage();
        yPos = 20;
      }
    });

    doc.save("equipment-report.pdf");
    toast({ title: "PDF exported successfully" });
  };

  const exportToExcel = () => {
    if (!reportData || reportData.length === 0) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      reportData.map((row) => {
        const newRow: any = {};
        selectedFields.forEach((fieldKey) => {
          const field = AVAILABLE_FIELDS.find((f) => f.key === fieldKey);
          newRow[field?.label || fieldKey] = getFieldValue(row, fieldKey);
        });
        return newRow;
      })
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Equipment Report");
    XLSX.writeFile(workbook, "equipment-report.xlsx");
    
    toast({ title: "Excel exported successfully" });
  };

  const exportToWord = async () => {
    if (!reportData || reportData.length === 0) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }

    const tableRows = [
      new DocxTableRow({
        children: selectedFields.map(
          (fieldKey) =>
            new DocxTableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: AVAILABLE_FIELDS.find((f) => f.key === fieldKey)?.label || fieldKey,
                      bold: true,
                    }),
                  ],
                }),
              ],
              width: { size: 100 / selectedFields.length, type: WidthType.PERCENTAGE },
            })
        ),
      }),
      ...reportData.slice(0, 100).map(
        (row) =>
          new DocxTableRow({
            children: selectedFields.map(
              (fieldKey) =>
                new DocxTableCell({
                  children: [new Paragraph(getFieldValue(row, fieldKey))],
                  width: { size: 100 / selectedFields.length, type: WidthType.PERCENTAGE },
                })
            ),
          })
      ),
    ];

    const table = new DocxTable({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    });

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({ text: "Equipment Report", heading: "Heading1" }),
            new Paragraph({ text: "" }),
            table,
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "equipment-report.docx";
    link.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Word document exported successfully" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dynamic Reports</h2>
        <p className="text-muted-foreground">
          Select fields to include in your report and export in your preferred format
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* Field Selection Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Select Fields</CardTitle>
            <CardDescription>Choose which data to include</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {/* Equipment Fields */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm">Equipment</h4>
                  <div className="space-y-2">
                    {AVAILABLE_FIELDS.filter((f) => f.table === "equipment").map((field) => (
                      <div key={field.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={field.key}
                          checked={selectedFields.includes(field.key)}
                          onCheckedChange={() => handleFieldToggle(field.key)}
                        />
                        <Label htmlFor={field.key} className="text-sm cursor-pointer">
                          {field.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Repair Fields */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm">Repairs</h4>
                  <div className="space-y-2">
                    {AVAILABLE_FIELDS.filter((f) => f.table === "repairs").map((field) => (
                      <div key={field.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={field.key}
                          checked={selectedFields.includes(field.key)}
                          onCheckedChange={() => handleFieldToggle(field.key)}
                        />
                        <Label htmlFor={field.key} className="text-sm cursor-pointer">
                          {field.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Profile Fields */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm">Owner Information</h4>
                  <div className="space-y-2">
                    {AVAILABLE_FIELDS.filter((f) => f.table === "profiles").map((field) => (
                      <div key={field.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={field.key}
                          checked={selectedFields.includes(field.key)}
                          onCheckedChange={() => handleFieldToggle(field.key)}
                        />
                        <Label htmlFor={field.key} className="text-sm cursor-pointer">
                          {field.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Report Preview and Export */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Report Preview</CardTitle>
                <CardDescription>
                  {reportData?.length || 0} record(s) found
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={exportToPDF} variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </Button>
                <Button onClick={exportToExcel} variant="outline" size="sm">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </Button>
                <Button onClick={exportToWord} variant="outline" size="sm">
                  <FileDown className="mr-2 h-4 w-4" />
                  Word
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading report data...</div>
            ) : reportData && reportData.length > 0 ? (
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {selectedFields.map((fieldKey) => {
                        const field = AVAILABLE_FIELDS.find((f) => f.key === fieldKey);
                        return (
                          <TableHead key={fieldKey} className="whitespace-nowrap">
                            {field?.label || fieldKey}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.map((row, index) => (
                      <TableRow key={index}>
                        {selectedFields.map((fieldKey) => (
                          <TableCell key={fieldKey} className="whitespace-nowrap">
                            {getFieldValue(row, fieldKey)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select fields to generate a report
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
