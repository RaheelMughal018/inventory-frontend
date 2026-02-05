// utils/pdfGenerator.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Import types from your API service
import type { PurchaseInvoiceResponse } from "../redux/services/purchaseInvoice";

export const generateInvoicePDF = (invoice: PurchaseInvoiceResponse) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to format currency
  const formatCurrency = (amount: string | number) => {
    return `${parseFloat(String(amount)).toFixed(2)}`;
  };

  let yPosition = 20;

  // ============================================
  // HEADER SECTION
  // ============================================
  
  // Company Name/Logo (replace with your company name)
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55); // Gray-800
  doc.text("POWER-GENIX", 12, yPosition);
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128); // Gray-500
  doc.text("123 Business Street, Lahore", 15, yPosition);
  yPosition += 5;
  doc.text("Phone: (123) 456-7890", 15, yPosition);

  // Invoice Title and Status on the right
  yPosition = 20;
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235); // Blue-600
  doc.text(`INVOICE`, pageWidth - 15, yPosition, { align: "right" });
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text(`Invoice #: ${invoice.id}`, pageWidth - 15, yPosition, { align: "right" });
  
  yPosition += 5;
  doc.text(`Date: ${formatDate(invoice.created_at)}`, pageWidth - 15, yPosition, { align: "right" });

  // Payment Status Badge
  yPosition += 6;
  const statusColors: Record<string, { bg: number[]; text: number[] }> = {
    PAID: { bg: [220, 252, 231], text: [21, 128, 61] },
    PARTIAL: { bg: [254, 249, 195], text: [161, 98, 7] },
    UNPAID: { bg: [254, 226, 226], text: [220, 38, 38] },
  };
  
  const statusColor = statusColors[invoice.payment_status] || statusColors.UNPAID;
  const statusText = invoice.payment_status;
  const statusWidth = doc.getTextWidth(statusText) + 8;
  
  doc.setFillColor(statusColor.bg[0], statusColor.bg[1], statusColor.bg[2]);
  doc.roundedRect(pageWidth - 15 - statusWidth, yPosition - 4, statusWidth, 7, 2, 2, "F");
  doc.setTextColor(statusColor.text[0], statusColor.text[1], statusColor.text[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(statusText, pageWidth - 15 - statusWidth / 2, yPosition, { align: "center" });

  // Horizontal line separator
  yPosition += 10;
  doc.setDrawColor(229, 231, 235); // Gray-200
  doc.setLineWidth(0.5);
  doc.line(15, yPosition, pageWidth - 15, yPosition);

  // ============================================
  // SUPPLIER INFORMATION
  // ============================================
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text("BILL:", 15, yPosition);

  yPosition += 7;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.supplier.name, 15, yPosition);
  
//   yPosition += 6;
//   doc.setFontSize(10);
//   doc.setFont("helvetica", "normal");
//   doc.setTextColor(107, 114, 128);
//   doc.text(`Supplier ID: ${invoice.supplier.user_id}`, 15, yPosition);

  // ============================================
  // INVOICE ITEMS TABLE
  // ============================================
  
  yPosition += 15;
  
  const itemsTableData = invoice.items.map((item) => [
    item.item_name,
    item.item_id,
    item.quantity,
    item.unit_price,
    item.line_total,
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Item Name", "Item ID", "Quantity", "Unit Price", "Line Total"]],
    body: itemsTableData,
    theme: "striped",
    headStyles: {
      fillColor: [37, 99, 235], // Blue-600
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [31, 41, 55],
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // Gray-50
    },
    margin: { left: 15, right: 15 },
    columnStyles: {
      0: { cellWidth: 60 }, // Item Name
      1: { cellWidth: 40 }, // Item ID
      2: { cellWidth: 25, halign: "center" }, // Quantity
      3: { cellWidth: 30, halign: "center" }, // Unit Price
      4: { cellWidth: 30, halign: "center" }, // Line Total
    },
  });

  yPosition = doc.lastAutoTable.finalY + 10;

  // ============================================
  // PAYMENT SUMMARY
  // ============================================
  
  const summaryX = pageWidth - 70;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  
  // Subtotal
  doc.text("Subtotal:", summaryX, yPosition);
  doc.text(formatCurrency(invoice.total_amount), pageWidth - 15, yPosition, { align: "right" });
  
  yPosition += 7;
  
  // Total Amount
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text("Total Amount:", summaryX, yPosition);
  doc.text(formatCurrency(invoice.total_amount), pageWidth - 15, yPosition, { align: "right" });
  
  yPosition += 7;
  
  // Paid Amount
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128); 
  doc.text("Paid Amount:", summaryX, yPosition);
  doc.text(formatCurrency(invoice.paid_amount), pageWidth - 15, yPosition, { align: "right" });
  
  yPosition += 7;
  
  // Balance Due
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(107, 114, 128); 
  doc.text("Balance Due:", summaryX, yPosition);
  doc.text(formatCurrency(invoice.balance_due), pageWidth - 15, yPosition, { align: "right" });

  // ============================================
  // PAYMENT HISTORY (if exists)
  // ============================================
  
  if (invoice.payments && invoice.payments.length > 0) {
    yPosition += 15;
    
    // Check if we need a new page
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 41, 55);
    doc.text("PAYMENT HISTORY", 15, yPosition);
    
    yPosition += 5;
    
    const paymentsTableData = invoice.payments.map((payment) => [
      payment.id,
      payment.account_name || "N/A",
      payment.account_type || "N/A",
      payment.payment_type,
      formatCurrency(payment.amount),
      formatDate(payment.created_at),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Payment ID", "Account", "Account Type", "Type", "Amount", "Date"]],
      body: paymentsTableData,
      theme: "striped",
      headStyles: {
        fillColor: [21, 128, 61], // Green-700
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [31, 41, 55],
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      margin: { left: 15, right: 15 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 35 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25, halign: "right" },
        5: { cellWidth: 35 },
      },
    });

    yPosition = doc.lastAutoTable.finalY + 10;
  }

  // ============================================
  // INVOICE SUMMARY STATS
  // ============================================
  
  // Check if we need a new page
  if (yPosition > pageHeight - 50) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text("INVOICE SUMMARY", 15, yPosition);
  
  yPosition += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  
  const totalQuantity = invoice.items.reduce((sum, item) => sum + item.quantity, 0);
  const itemsCount = invoice.items.length;
  const paymentsCount = invoice.payments?.length || 0;

  doc.text(`Total Items: ${itemsCount}`, 15, yPosition);
  yPosition += 5;
  doc.text(`Total Quantity: ${totalQuantity}`, 15, yPosition);
  yPosition += 5;
  doc.text(`Payments Made: ${paymentsCount}`, 15, yPosition);

  // ============================================
  // FOOTER
  // ============================================
  
  const footerY = pageHeight - 20;
  
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text("Thank you for your business!", pageWidth / 2, footerY, { align: "center" });
  doc.text(
    `Generated on ${new Date().toLocaleDateString("en-US")}`,
    pageWidth / 2,
    footerY + 4,
    { align: "center" }
  );

  // ============================================
  // SAVE PDF
  // ============================================
  
  doc.save(`Invoice_${invoice.id}_${new Date().toISOString().split("T")[0]}.pdf`);
};;