// utils/pdfGenerator.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Import types from your API service
import type { PurchaseInvoice } from "../redux/services/purchaseInvoice";
import type { SupplierStatement } from "../redux/services/supplierStatement";

export const generateInvoicePDF = (invoice: PurchaseInvoice) => {
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
  doc.text("SUPPLIER:", 15, yPosition);

  yPosition += 7;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.supplier_name || `Supplier #${invoice.supplier_id}`, 15, yPosition);

  // ============================================
  // INVOICE ITEMS TABLE
  // ============================================
  
  yPosition += 15;
  
  const itemsTableData = invoice.items?.map((item) => [
    item.item_name,
    item.item_id,
    item.quantity,
    item.unit_price,
    item.total_price,
  ]) || [];

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
  
  // Outstanding Amount
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(107, 114, 128); 
  doc.text("Outstanding:", summaryX, yPosition);
  doc.text(formatCurrency(invoice.outstanding_amount || 0), pageWidth - 15, yPosition, { align: "right" });



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
  
  doc.save(`Invoice_${invoice.invoice_number}_${new Date().toISOString().split("T")[0]}.pdf`);
};

// ============================================
// SUPPLIER STATEMENT PDF GENERATOR
// ============================================

export const generateSupplierStatementPDF = (
  statement: SupplierStatement,
  fromDate?: string,
  toDate?: string
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper function to format currency
  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `$${numAmount.toFixed(2)}`;
  };

  let yPosition = 20;

  // ============================================
  // MODERN HEADER SECTION
  // ============================================
  
  // Company Name with gradient effect (simulated with color)
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(59, 130, 246); // Blue-500
  doc.text("POWER-GENIX", 15, yPosition);
  
  yPosition += 10;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text("Inventory Management System", 15, yPosition);
  
  yPosition += 5;
  doc.text("123 Business Street, Lahore, Pakistan", 15, yPosition);
  
  yPosition += 4;
  doc.text("Phone: (123) 456-7890 | Email: info@powergenix.com", 15, yPosition);

  // Statement Title on the right with modern styling
  yPosition = 20;
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text("SUPPLIER", pageWidth - 15, yPosition, { align: "right" });
  
  yPosition += 8;
  doc.text("STATEMENT", pageWidth - 15, yPosition, { align: "right" });
  
  yPosition += 10;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${formatDate(new Date().toISOString())}`, pageWidth - 15, yPosition, { align: "right" });
  
  // Add date range if provided
  if (fromDate || toDate) {
    yPosition += 5;
    let dateRangeText = "Period: ";
    if (fromDate && toDate) {
      dateRangeText += `${formatDate(fromDate)} - ${formatDate(toDate)}`;
    } else if (fromDate) {
      dateRangeText += `From ${formatDate(fromDate)} onwards`;
    } else if (toDate) {
      dateRangeText += `Up to ${formatDate(toDate)}`;
    }
    doc.setTextColor(79, 70, 229); // Indigo-600
    doc.setFont("helvetica", "bold");
    doc.text(dateRangeText, pageWidth - 15, yPosition, { align: "right" });
  }

  // Modern separator line with gradient effect
  yPosition += 8;
  doc.setDrawColor(203, 213, 225); // Slate-300
  doc.setLineWidth(0.5);
  doc.line(15, yPosition, pageWidth - 15, yPosition);

  // ============================================
  // SUPPLIER DETAILS CARD
  // ============================================
  
  yPosition += 12;
  
  // Card background
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.roundedRect(15, yPosition - 3, pageWidth - 30, 32, 3, 3, "F");
  
  // Card title
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("SUPPLIER DETAILS", 20, yPosition + 3);
  
  yPosition += 10;
  
  // Supplier info in two columns
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105); // Slate-600
  
  const leftCol = 20;
  const rightCol = pageWidth / 2 + 10;
  
  // Left column
  doc.setFont("helvetica", "bold");
  doc.text("Supplier Name:", leftCol, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(statement.supplier_name, leftCol + 30, yPosition);
  
  if (statement.company_name) {
    doc.setFont("helvetica", "bold");
    doc.text("Company:", rightCol, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(statement.company_name, rightCol + 20, yPosition);
  }
  
  yPosition += 6;
  
  if (statement.phone) {
    doc.setFont("helvetica", "bold");
    doc.text("Phone:", leftCol, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(statement.phone, leftCol + 30, yPosition);
  }
  
  if (statement.address) {
    doc.setFont("helvetica", "bold");
    doc.text("Address:", rightCol, yPosition);
    doc.setFont("helvetica", "normal");
    const addressText = statement.address.length > 35 ? statement.address.substring(0, 35) + "..." : statement.address;
    doc.text(addressText, rightCol + 20, yPosition);
  }

  // ============================================
  // FINANCIAL SUMMARY CARDS (Modern Design)
  // ============================================
  
  yPosition += 15;
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("FINANCIAL SUMMARY", 15, yPosition);
  
  yPosition += 10;
  
  const cardWidth = (pageWidth - 40) / 4;
  const cardHeight = 28;
  const cardSpacing = 3;
  
  // Summary cards data with modern colors
  const summaryCards = [
    {
      title: "Total Purchases",
      value: formatCurrency(statement.summary.total_purchases),
      subtitle: `${statement.summary.invoice_count} invoices`,
      bgColor: [239, 246, 255], // Blue-50
      borderColor: [147, 197, 253], // Blue-300
      textColor: [29, 78, 216], // Blue-700
    },
    {
      title: "Total Payments",
      value: formatCurrency(statement.summary.total_payments),
      subtitle: `${statement.summary.payment_count} payments`,
      bgColor: [240, 253, 244], // Green-50
      borderColor: [134, 239, 172], // Green-300
      textColor: [21, 128, 61], // Green-700
    },
    {
      title: "Outstanding",
      value: formatCurrency(statement.summary.outstanding_balance),
      subtitle: `${statement.summary.unpaid_invoice_count} unpaid`,
      bgColor: [255, 247, 237], // Orange-50
      borderColor: [253, 186, 116], // Orange-300
      textColor: [194, 65, 12], // Orange-700
    },
    {
      title: "Current Balance",
      value: formatCurrency(statement.current_balance),
      subtitle: `Open: ${formatCurrency(statement.opening_balance)}`,
      bgColor: [250, 245, 255], // Purple-50
      borderColor: [216, 180, 254], // Purple-300
      textColor: [126, 34, 206], // Purple-700
    },
  ];
  
  summaryCards.forEach((card, index) => {
    const cardX = 15 + index * (cardWidth + cardSpacing);
    
    // Card background with border
    doc.setFillColor(card.bgColor[0], card.bgColor[1], card.bgColor[2]);
    doc.setDrawColor(card.borderColor[0], card.borderColor[1], card.borderColor[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(cardX, yPosition, cardWidth, cardHeight, 2, 2, "FD");
    
    // Card title
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(card.textColor[0], card.textColor[1], card.textColor[2]);
    doc.text(card.title.toUpperCase(), cardX + cardWidth / 2, yPosition + 5, { align: "center" });
    
    // Card value
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(card.value, cardX + cardWidth / 2, yPosition + 14, { align: "center" });
    
    // Card subtitle
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.text(card.subtitle, cardX + cardWidth / 2, yPosition + 20, { align: "center" });
  });

  yPosition += cardHeight + 15;

  // ============================================
  // INVOICES TABLE (Modern Design)
  // ============================================
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(`PURCHASE INVOICES (${statement.invoices.length})`, 15, yPosition);
  
  yPosition += 5;
  
  if (statement.invoices.length > 0) {
    const invoicesTableData = statement.invoices.map((invoice) => [
      invoice.invoice_number,
      formatDate(invoice.invoice_date),
      invoice.due_date ? formatDate(invoice.due_date) : "—",
      formatCurrency(invoice.total_amount),
      formatCurrency(invoice.paid_amount),
      formatCurrency(invoice.outstanding_amount),
      invoice.payment_status,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Invoice #", "Date", "Due Date", "Total", "Paid", "Outstanding", "Status"]],
      body: invoicesTableData,
      theme: "grid",
      headStyles: {
        fillColor: [59, 130, 246], // Blue-500
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252], // Slate-50
      },
      columnStyles: {
        0: { cellWidth: 30, fontStyle: "bold" },
        1: { cellWidth: 25, halign: "center" },
        2: { cellWidth: 25, halign: "center" },
        3: { cellWidth: 25, halign: "right" },
        4: { cellWidth: 25, halign: "right", textColor: [21, 128, 61] },
        5: { cellWidth: 25, halign: "right", textColor: [220, 38, 38] },
        6: { cellWidth: 20, halign: "center", fontStyle: "bold" },
      },
      margin: { left: 15, right: 15 },
      didParseCell: function(data) {
        // Color code status column
        if (data.column.index === 6 && data.section === 'body') {
          const status = data.cell.raw as string;
          if (status === 'PAID') {
            data.cell.styles.textColor = [21, 128, 61]; // Green
            data.cell.styles.fillColor = [220, 252, 231]; // Green-100
          } else if (status === 'PARTIAL') {
            data.cell.styles.textColor = [161, 98, 7]; // Yellow
            data.cell.styles.fillColor = [254, 249, 195]; // Yellow-100
          } else if (status === 'UNPAID') {
            data.cell.styles.textColor = [220, 38, 38]; // Red
            data.cell.styles.fillColor = [254, 226, 226]; // Red-100
          }
        }
      }
    });

    yPosition = doc.lastAutoTable.finalY + 12;
  } else {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("No invoices found", 15, yPosition + 5);
    yPosition += 15;
  }

  // Check if we need a new page for payments
  if (yPosition > pageHeight - 80) {
    doc.addPage();
    yPosition = 20;
  }

  // ============================================
  // PAYMENTS TABLE (Modern Design)
  // ============================================
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(`PAYMENT HISTORY (${statement.payments.length})`, 15, yPosition);
  
  yPosition += 5;
  
  if (statement.payments.length > 0) {
    const paymentsTableData = statement.payments.map((payment) => [
      payment.payment_number,
      formatDate(payment.payment_date),
      formatCurrency(payment.amount),
      payment.account_name,
      payment.invoice_number || "Direct Payment",
      payment.notes || "—",
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Payment #", "Date", "Amount", "Account", "Invoice", "Notes"]],
      body: paymentsTableData,
      theme: "grid",
      headStyles: {
        fillColor: [16, 185, 129], // Green-500
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59],
      },
      alternateRowStyles: {
        fillColor: [240, 253, 244], // Green-50
      },
      columnStyles: {
        0: { cellWidth: 28, fontStyle: "bold" },
        1: { cellWidth: 25, halign: "center" },
        2: { cellWidth: 25, halign: "right", fontStyle: "bold", textColor: [21, 128, 61] },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
        5: { cellWidth: 42 },
      },
      margin: { left: 15, right: 15 },
    });

    yPosition = doc.lastAutoTable.finalY + 12;
  } else {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("No payments found", 15, yPosition + 5);
    yPosition += 15;
  }

  // ============================================
  // MODERN FOOTER
  // ============================================
  
  const footerY = pageHeight - 25;
  
  // Footer separator
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(15, footerY - 8, pageWidth - 15, footerY - 8);
  
  // Footer content
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("POWER-GENIX Inventory Management System", pageWidth / 2, footerY, { align: "center" });
  
  doc.setFontSize(7);
  doc.text(
    `This is a computer-generated statement. Generated on ${formatDate(new Date().toISOString())} at ${new Date().toLocaleTimeString("en-US")}`,
    pageWidth / 2,
    footerY + 4,
    { align: "center" }
  );
  
  doc.text("For any queries, please contact: finance@powergenix.com", pageWidth / 2, footerY + 8, { align: "center" });

  // ============================================
  // SAVE PDF
  // ============================================
  
  const fileName = `Supplier_Statement_${statement.supplier_name.replace(/\s+/g, '_')}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
};