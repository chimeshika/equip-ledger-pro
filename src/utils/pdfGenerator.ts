import jsPDF from 'jspdf';
import { Equipment } from '@/hooks/useEquipment';
import { Repair } from '@/hooks/useRepairs';
import { formatLKR } from '@/lib/currency';

export const generateEquipmentPDF = (equipment: Equipment, repairs: Repair[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  
  let yPosition = margin;
  
  // Header with title
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(25, 118, 210); // Blue color
  doc.text('EQUIPMENT REPORT', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;
  
  // Equipment name and serial
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(equipment.item_name, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Serial Number: ${equipment.serial_number}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 20;
  
  // Draw line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;
  
  // Equipment Information Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('EQUIPMENT INFORMATION', margin, yPosition);
  yPosition += 10;
  
  // Two-column layout for equipment info
  const leftColumn = margin;
  const rightColumn = pageWidth / 2 + 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const equipmentInfo = [
    ['Brand/Model:', equipment.brand || 'Not specified'],
    ['Category:', equipment.category],
    ['Condition:', equipment.condition],
    ['Location:', equipment.location || 'Not specified'],
    ['Assigned To:', equipment.assigned_to || 'Unassigned'],
    ['Purchase Date:', equipment.purchase_date ? new Date(equipment.purchase_date).toLocaleDateString() : 'Not specified'],
    ['Supplier:', equipment.supplier || 'Not specified'],
    ['Price (LKR):', equipment.price ? formatLKR(equipment.price) : 'Not specified'],
    ['Warranty Period:', equipment.warranty_period || 'Not specified'],
  ];
  
  equipmentInfo.forEach((info, index) => {
    const column = index % 2 === 0 ? leftColumn : rightColumn;
    const row = Math.floor(index / 2);
    const y = yPosition + (row * 12);
    
    doc.setFont('helvetica', 'bold');
    doc.text(info[0], column, y);
    doc.setFont('helvetica', 'normal');
    doc.text(info[1], column + 35, y);
  });
  
  yPosition += Math.ceil(equipmentInfo.length / 2) * 12 + 15;
  
  // Financial Summary Box
  if (equipment.price || repairs.length > 0) {
    const totalRepairCost = repairs.reduce((sum, repair) => sum + repair.repair_cost, 0);
    const totalInvestment = (equipment.price || 0) + totalRepairCost;
    
    // Draw box background
    doc.setFillColor(248, 250, 252); // Light gray background
    doc.rect(margin, yPosition, contentWidth, 35, 'F');
    
    // Box border
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, yPosition, contentWidth, 35, 'S');
    
    yPosition += 8;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('FINANCIAL SUMMARY', margin + 5, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const financialData = [
      `Initial Cost: ${formatLKR(equipment.price || 0)}`,
      `Total Repairs: ${formatLKR(totalRepairCost)}`,
      `Total Investment: ${formatLKR(totalInvestment)}`
    ];
    
    financialData.forEach((data, index) => {
      doc.text(data, margin + 5 + (index * (contentWidth / 3)), yPosition);
    });
    
    yPosition += 20;
  }
  
  // Repair History Section
  if (repairs.length > 0) {
    yPosition += 10;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('REPAIR HISTORY', margin, yPosition);
    yPosition += 10;
    
    repairs.forEach((repair, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = margin;
      }
      
      // Repair box
      doc.setFillColor(254, 249, 195); // Light yellow background
      doc.rect(margin, yPosition, contentWidth, 25, 'F');
      doc.setDrawColor(245, 158, 11); // Orange border
      doc.rect(margin, yPosition, contentWidth, 25, 'S');
      
      yPosition += 6;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Repair #${index + 1}`, margin + 5, yPosition);
      doc.text(formatLKR(repair.repair_cost), pageWidth - margin - 40, yPosition);
      
      yPosition += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${new Date(repair.repair_date).toLocaleDateString()}`, margin + 5, yPosition);
      
      yPosition += 5;
      const description = doc.splitTextToSize(repair.description, contentWidth - 20);
      doc.text(description, margin + 5, yPosition);
      
      yPosition += description.length * 4 + 10;
    });
    
    // Repair Summary
    yPosition += 5;
    const totalRepairCost = repairs.reduce((sum, repair) => sum + repair.repair_cost, 0);
    
    doc.setFillColor(220, 252, 231); // Light green background
    doc.rect(margin, yPosition, contentWidth, 20, 'F');
    doc.setDrawColor(34, 197, 94); // Green border
    doc.rect(margin, yPosition, contentWidth, 20, 'S');
    
    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Repairs: ${repairs.length}`, margin + 5, yPosition);
    doc.text(`Total Cost: ${formatLKR(totalRepairCost)}`, margin + 80, yPosition);
    doc.text(`Average: ${formatLKR(totalRepairCost / repairs.length)}`, margin + 170, yPosition);
  }
  
  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, pageWidth / 2, footerY, { align: 'center' });
  
  // Save the PDF
  doc.save(`Equipment_Report_${equipment.serial_number}.pdf`);
};
