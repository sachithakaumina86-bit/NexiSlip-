import { jsPDF } from 'jspdf';
import * as htmlToImage from 'html-to-image';
import saveAs from 'file-saver';
import {
  Document,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  Packer,
} from 'docx';
import { Invoice } from '../types';
import { formatCurrency } from './calculations';

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 80);
}

export function getExportFilename(invoice: Invoice, extension: string): string {
  const invNum = sanitizeFilename(invoice.invoiceNumber || 'INV-001');
  const client = sanitizeFilename(invoice.client.clientName || 'Client');
  return `NexiSlip-${invNum}-${client}.${extension}`;
}

export function formatCurrencyForPdf(amount: number, currencyCode = 'USD'): string {
  const num = Number(amount) || 0;
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const currencyMap: Record<string, string> = {
    USD: '$',
    CAD: 'CA$',
    AUD: 'A$',
    NZD: 'NZ$',
    SGD: 'S$',
    LKR: 'Rs. ',
    EUR: 'EUR ',
    GBP: 'GBP ',
    JPY: 'JPY ',
    INR: 'INR ',
    CHF: 'CHF ',
    AED: 'AED ',
    BRL: 'R$ ',
  };

  const symbol = currencyMap[currencyCode] || `${currencyCode} `;
  return `${symbol}${formatted}`;
}

export function drawInvoiceToPdf(doc: jsPDF, invoice: Invoice, pageOffset = 0, isMultiInvoice = false) {
  const template = invoice.templateId || 'modern';

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  let y = 50;

  // Top accent bars based on template
  if (template === 'classic') {
    doc.setFillColor(30, 41, 59); // slate-800 corporate bar
    doc.rect(margin, 35, pageWidth - 2 * margin, 4, 'F');
  } else if (template === 'professional') {
    doc.setFillColor(15, 118, 110); // teal-700 executive bar
    doc.rect(margin, 35, pageWidth - 2 * margin, 4, 'F');
  } else if (template === 'creative') {
    doc.setFillColor(124, 58, 237); // violet-600 creative bar
    doc.rect(margin, 35, pageWidth - 2 * margin, 4, 'F');
  } else if (template === 'modern') {
    doc.setFillColor(37, 99, 235); // blue-600 modern bar
    doc.rect(margin, 35, pageWidth - 2 * margin, 3, 'F');
  }

  // Optional Logo embedding
  let logoOffset = 0;
  if (invoice.seller.logoUrl && invoice.seller.logoUrl.startsWith('data:image/')) {
    try {
      doc.addImage(invoice.seller.logoUrl, 'PNG', margin, y - 5, 42, 42);
      logoOffset = 52;
    } catch (e) {
      console.warn('Could not render logo in PDF:', e);
    }
  }

  // Header / Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  if (template === 'creative') {
    doc.setTextColor(109, 40, 217); // violet-700
  } else if (template === 'professional') {
    doc.setTextColor(15, 118, 110); // teal-700
  } else {
    doc.setTextColor(30, 41, 59); // slate-800
  }
  doc.text(invoice.seller.businessName || 'NexiSlip', margin + logoOffset, y + 14);

  // Document Title (e.g. INVOICE, BILLING SLIP, TAX INVOICE)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  if (template === 'creative') {
    doc.setTextColor(124, 58, 237);
  } else if (template === 'professional') {
    doc.setTextColor(15, 118, 110);
  } else if (template === 'classic') {
    doc.setTextColor(30, 41, 59);
  } else {
    doc.setTextColor(100, 116, 139);
  }
  doc.text(invoice.documentTitle || 'INVOICE', pageWidth - margin, y + 5, { align: 'right' });

  // Status Badge
  const statusColors: Record<string, { bg: [number, number, number]; text: [number, number, number]; label: string }> = {
    paid: { bg: [209, 250, 229], text: [6, 95, 70], label: 'PAID' },
    sent: { bg: [219, 234, 254], text: [30, 64, 175], label: 'SENT' },
    partially_paid: { bg: [254, 243, 199], text: [146, 64, 14], label: 'PARTIALLY PAID' },
    overdue: { bg: [254, 226, 226], text: [153, 27, 27], label: 'OVERDUE' },
    cancelled: { bg: [241, 245, 249], text: [71, 85, 105], label: 'CANCELLED' },
    draft: { bg: [241, 245, 249], text: [100, 116, 139], label: 'DRAFT' },
  };
  const statusCfg = statusColors[invoice.status] || statusColors.draft;
  const badgeWidth = doc.getTextWidth(statusCfg.label) + 14;
  const badgeX = pageWidth - margin - badgeWidth;
  const badgeY = y + 14;
  doc.setFillColor(statusCfg.bg[0], statusCfg.bg[1], statusCfg.bg[2]);
  doc.roundedRect(badgeX, badgeY, badgeWidth, 14, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(statusCfg.text[0], statusCfg.text[1], statusCfg.text[2]);
  doc.text(statusCfg.label, badgeX + badgeWidth / 2, badgeY + 10, { align: 'center' });

  // Invoice Number
  y += 42;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  if (template === 'modern') {
    doc.setTextColor(37, 99, 235); // blue-600
  } else if (template === 'professional') {
    doc.setTextColor(15, 118, 110); // teal-700
  } else if (template === 'creative') {
    doc.setTextColor(124, 58, 237); // violet-600
  } else if (template === 'classic') {
    doc.setTextColor(30, 41, 59); // slate-800
  } else {
    doc.setTextColor(71, 85, 105); // slate-600
  }
  doc.text(`#${invoice.invoiceNumber}`, pageWidth - margin, y, { align: 'right' });

  // Seller Details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  let sellerY = y - 10;
  if (invoice.seller.sellerName) {
    doc.text(invoice.seller.sellerName, margin, sellerY);
    sellerY += 12;
  }
  if (invoice.seller.address) {
    const addressLines = doc.splitTextToSize(invoice.seller.address, 220);
    doc.text(addressLines, margin, sellerY);
    sellerY += addressLines.length * 12;
  }
  if (invoice.seller.email) {
    doc.text(invoice.seller.email, margin, sellerY);
    sellerY += 12;
  }
  if (invoice.seller.phone) {
    doc.text(invoice.seller.phone, margin, sellerY);
    sellerY += 12;
  }
  if (invoice.seller.taxNumber) {
    doc.text(`Tax ID: ${invoice.seller.taxNumber}`, margin, sellerY);
    sellerY += 12;
  }

  // Divider line
  y = Math.max(sellerY, 130) + 10;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 20;

  // Bill To & Invoice Meta Block
  const col2X = pageWidth - margin - 180;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('BILLED TO:', margin, y);
  doc.text('INVOICE DETAILS:', col2X, y);

  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  let billToY = y;
  doc.text(invoice.client.clientName || 'Valued Client', margin, billToY);
  billToY += 12;
  if (invoice.client.address) {
    const clientAddress = doc.splitTextToSize(invoice.client.address, 220);
    doc.text(clientAddress, margin, billToY);
    billToY += clientAddress.length * 12;
  }
  if (invoice.client.email) {
    doc.text(invoice.client.email, margin, billToY);
    billToY += 12;
  }
  if (invoice.client.phone) {
    doc.text(invoice.client.phone, margin, billToY);
    billToY += 12;
  }
  if (invoice.client.taxNumber) {
    doc.text(`VAT / Tax ID: ${invoice.client.taxNumber}`, margin, billToY);
    billToY += 12;
  }

  let detailsY = y;
  doc.text(`Issue Date: ${invoice.issueDate || '—'}`, col2X, detailsY);
  detailsY += 12;
  doc.text(`Due Date: ${invoice.dueDate || '—'}`, col2X, detailsY);
  detailsY += 12;
  if (invoice.purchaseOrder) {
    doc.text(`PO Number: ${invoice.purchaseOrder}`, col2X, detailsY);
    detailsY += 12;
  }
  if (invoice.paymentTerms) {
    doc.text(`Payment Terms: ${invoice.paymentTerms}`, col2X, detailsY);
    detailsY += 12;
  }
  doc.text(`Currency: ${invoice.currency || 'USD'}`, col2X, detailsY);
  detailsY += 12;

  y = Math.max(billToY, detailsY) + 16;

  // Function to render table header
  const renderTableHeader = (currentY: number) => {
    if (template === 'classic') {
      doc.setFillColor(30, 41, 59); // slate-800
      doc.rect(margin, currentY, pageWidth - 2 * margin, 22, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
    } else if (template === 'professional') {
      doc.setFillColor(15, 118, 110); // teal-700
      doc.rect(margin, currentY, pageWidth - 2 * margin, 22, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
    } else if (template === 'creative') {
      doc.setFillColor(124, 58, 237); // violet-600
      doc.rect(margin, currentY, pageWidth - 2 * margin, 22, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
    } else if (template === 'minimal') {
      doc.setDrawColor(15, 23, 42); // slate-900
      doc.setLineWidth(1);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      doc.line(margin, currentY + 22, pageWidth - margin, currentY + 22);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
    } else {
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(margin, currentY, pageWidth - 2 * margin, 22, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, currentY, pageWidth - 2 * margin, 22, 'S');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
    }

    const colDesc = margin + 10;
    const colQty = margin + 250;
    const colPrice = margin + 340;
    const colTotal = pageWidth - margin - 10;

    doc.text('DESCRIPTION', colDesc, currentY + 15);
    doc.text('QTY', colQty, currentY + 15, { align: 'right' });
    doc.text('UNIT PRICE', colPrice, currentY + 15, { align: 'right' });
    doc.text('AMOUNT', colTotal, currentY + 15, { align: 'right' });
  };

  renderTableHeader(y);
  y += 22;

  // Table Rows with overflow handling
  const colDesc = margin + 10;
  const colQty = margin + 250;
  const colPrice = margin + 340;
  const colTotal = pageWidth - margin - 10;

  invoice.lineItems.forEach((item, index) => {
    // Check if new page is needed for table rows
    if (y > pageHeight - 160) {
      doc.addPage();
      y = 50;
      renderTableHeader(y);
      y += 22;
    }

    const rowBg = index % 2 === 1;
    if (rowBg && template !== 'minimal') {
      doc.setFillColor(250, 250, 252);
      doc.rect(margin, y, pageWidth - 2 * margin, 20, 'F');
    }

    const descLines = doc.splitTextToSize(item.description || 'Item description', 220);
    const rowHeight = Math.max(20, descLines.length * 12 + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    doc.text(descLines, colDesc, y + 13);
    doc.text(String(item.quantity || 1), colQty, y + 13, { align: 'right' });
    doc.text(formatCurrencyForPdf(item.unitPrice, invoice.currency), colPrice, y + 13, { align: 'right' });
    doc.text(formatCurrencyForPdf(item.total, invoice.currency), colTotal, y + 13, { align: 'right' });

    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);

    y += rowHeight;
  });

  // Check if totals block needs a new page
  if (y > pageHeight - 200) {
    doc.addPage();
    y = 50;
  } else {
    y += 12;
  }

  // Totals Section
  const totalsLabelX = pageWidth - margin - 170;
  const totalsValueX = pageWidth - margin - 10;

  const printTotalRow = (label: string, value: string, isBold = false) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(isBold ? 10.5 : 9);
    doc.setTextColor(isBold ? 15 : 71, isBold ? 23 : 85, isBold ? 42 : 105);
    doc.text(label, totalsLabelX, y);
    doc.text(value, totalsValueX, y, { align: 'right' });
    y += 16;
  };

  printTotalRow('Subtotal:', formatCurrencyForPdf(invoice.subtotal, invoice.currency));
  if (invoice.discount > 0) {
    printTotalRow('Discount:', `-${formatCurrencyForPdf(invoice.discount, invoice.currency)}`);
  }
  if (invoice.taxAmount > 0) {
    printTotalRow(`Tax (${invoice.taxRate}%):`, formatCurrencyForPdf(invoice.taxAmount, invoice.currency));
  }
  if (invoice.extraCharges > 0) {
    printTotalRow('Extra Charges:', formatCurrencyForPdf(invoice.extraCharges, invoice.currency));
  }

  // Grand Total highlight box
  if (template === 'modern') {
    doc.setFillColor(239, 246, 255); // blue-50
    doc.rect(totalsLabelX - 8, y - 4, 180, 24, 'F');
  } else if (template === 'professional') {
    doc.setFillColor(240, 253, 250); // teal-50
    doc.rect(totalsLabelX - 8, y - 4, 180, 24, 'F');
    doc.setDrawColor(94, 234, 212); // teal-300
    doc.rect(totalsLabelX - 8, y - 4, 180, 24, 'S');
  } else if (template === 'creative') {
    doc.setFillColor(245, 243, 255); // violet-50
    doc.rect(totalsLabelX - 8, y - 4, 180, 24, 'F');
    doc.setDrawColor(216, 180, 254); // violet-300
    doc.rect(totalsLabelX - 8, y - 4, 180, 24, 'S');
  } else if (template === 'classic') {
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(totalsLabelX - 8, y - 4, 180, 24, 'F');
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.rect(totalsLabelX - 8, y - 4, 180, 24, 'S');
  } else {
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(totalsLabelX - 8, y - 4, pageWidth - margin, y - 4);
  }
  printTotalRow('Grand Total:', formatCurrencyForPdf(invoice.total, invoice.currency), true);

  if (invoice.amountPaid > 0) {
    printTotalRow('Amount Paid:', formatCurrencyForPdf(invoice.amountPaid, invoice.currency));
    printTotalRow('Balance Due:', formatCurrencyForPdf(invoice.balanceDue, invoice.currency), true);
  } else {
    printTotalRow('Balance Due:', formatCurrencyForPdf(invoice.balanceDue, invoice.currency), true);
  }

  if (template === 'classic') {
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.75);
    doc.line(totalsLabelX - 8, y - 2, pageWidth - margin, y - 2);
    doc.line(totalsLabelX - 8, y + 1, pageWidth - margin, y + 1);
  }

  // Notes & Payment Instructions
  y += 12;
  if (invoice.paymentInstructions) {
    if (y > pageHeight - 80) {
      doc.addPage();
      y = 50;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text('Payment Instructions:', margin, y);
    y += 11;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const instLines = doc.splitTextToSize(invoice.paymentInstructions, 320);
    doc.text(instLines, margin, y);
    y += instLines.length * 10 + 6;
  }

  if (invoice.notes) {
    if (y > pageHeight - 70) {
      doc.addPage();
      y = 50;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text('Notes / Terms:', margin, y);
    y += 11;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const noteLines = doc.splitTextToSize(invoice.notes, 320);
    doc.text(noteLines, margin, y);
    y += noteLines.length * 10 + 6;
  }

  // Footer Tagline & Watermark
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  const footerText = isMultiInvoice
    ? `NexiSlip Invoice #${invoice.invoiceNumber} • Billed to ${invoice.client.clientName || 'Client'}`
    : 'Generated with NexiSlip — Professional Invoicing Made Simple.';
  doc.text(footerText, margin, pageHeight - 25);
  doc.text(`Template: ${template.toUpperCase()}`, pageWidth - margin, pageHeight - 25, { align: 'right' });
}

export async function exportToPdf(invoice: Invoice, elementId?: string): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  drawInvoiceToPdf(doc, invoice);

  // Stamp page numbers on every page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${totalPages}`,
      doc.internal.pageSize.getWidth() - 40,
      doc.internal.pageSize.getHeight() - 15,
      { align: 'right' }
    );
  }

  doc.save(getExportFilename(invoice, 'pdf'));
}

export async function exportBatchInvoicesToPdf(invoices: Invoice[]): Promise<void> {
  if (invoices.length === 0) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  invoices.forEach((inv, index) => {
    if (index > 0) {
      doc.addPage();
    }
    drawInvoiceToPdf(doc, inv, index, true);
  });

  // Stamp page numbers on every page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Document Page ${i} of ${totalPages}`,
      doc.internal.pageSize.getWidth() - 40,
      doc.internal.pageSize.getHeight() - 15,
      { align: 'right' }
    );
  }

  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`NexiSlip-Saved-Invoices-Batch-${dateStr}.pdf`);
}

export async function exportToImage(invoice: Invoice, elementId: string, format: 'png' | 'jpeg'): Promise<void> {
  const node = document.getElementById(elementId);
  if (!node) {
    throw new Error(`Invoice preview element with ID "${elementId}" not found`);
  }

  const options = {
    quality: 0.95,
    backgroundColor: '#ffffff',
    pixelRatio: 2, // High resolution crisp export
  };

  const dataUrl = format === 'png' ? await htmlToImage.toPng(node, options) : await htmlToImage.toJpeg(node, options);

  const ext = format === 'png' ? 'png' : 'jpg';
  const filename = getExportFilename(invoice, ext);

  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export async function exportToDocx(invoice: Invoice): Promise<void> {
  const tableRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: 'Description', bold: true })] })],
        }),
        new TableCell({
          width: { size: 15, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: 'Qty', bold: true })], alignment: AlignmentType.RIGHT })],
        }),
        new TableCell({
          width: { size: 15, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: 'Unit Price', bold: true })], alignment: AlignmentType.RIGHT })],
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: 'Total', bold: true })], alignment: AlignmentType.RIGHT })],
        }),
      ],
    }),
  ];

  invoice.lineItems.forEach((item) => {
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: item.description || 'Item' })],
          }),
          new TableCell({
            children: [new Paragraph({ text: String(item.quantity), alignment: AlignmentType.RIGHT })],
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: formatCurrency(item.unitPrice, invoice.currency),
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: formatCurrency(item.total, invoice.currency),
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        ],
      })
    );
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            heading: HeadingLevel.TITLE,
            children: [
              new TextRun({
                text: invoice.seller.businessName || 'NexiSlip',
                bold: true,
                size: 36,
                color: '1E293B',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${invoice.documentTitle} #${invoice.invoiceNumber}`,
                bold: true,
                size: 24,
                color: '2563EB',
              }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Billed To: ', bold: true }),
              new TextRun({ text: invoice.client.clientName }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Client Address: ' }),
              new TextRun({ text: invoice.client.address || '—' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Issue Date: ', bold: true }),
              new TextRun({ text: invoice.issueDate }),
              new TextRun({ text: '   |   Due Date: ', bold: true }),
              new TextRun({ text: invoice.dueDate }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows,
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: `Subtotal: ${formatCurrency(invoice.subtotal, invoice.currency)}` }),
            ],
          }),
          ...(invoice.discount > 0
            ? [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      text: `Discount: -${formatCurrency(invoice.discount, invoice.currency)}`,
                    }),
                  ],
                }),
              ]
            : []),
          ...(invoice.taxAmount > 0
            ? [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      text: `Tax (${invoice.taxRate}%): ${formatCurrency(invoice.taxAmount, invoice.currency)}`,
                    }),
                  ],
                }),
              ]
            : []),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `Grand Total: ${formatCurrency(invoice.total, invoice.currency)}`,
                bold: true,
                size: 28,
                color: '1E3A8A',
              }),
            ],
          }),
          ...(invoice.balanceDue > 0
            ? [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      text: `Balance Due: ${formatCurrency(invoice.balanceDue, invoice.currency)}`,
                      bold: true,
                      color: 'DC2626',
                    }),
                  ],
                }),
              ]
            : []),
          new Paragraph({ text: '' }),
          ...(invoice.paymentInstructions
            ? [
                new Paragraph({
                  children: [new TextRun({ text: 'Payment Instructions:', bold: true })],
                }),
                new Paragraph({ text: invoice.paymentInstructions }),
                new Paragraph({ text: '' }),
              ]
            : []),
          ...(invoice.notes
            ? [
                new Paragraph({
                  children: [new TextRun({ text: 'Notes:', bold: true })],
                }),
                new Paragraph({ text: invoice.notes }),
              ]
            : []),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Generated with NexiSlip — The Quickest Way to Bill Your Clients.',
                italics: true,
                color: '94A3B8',
                size: 16,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, getExportFilename(invoice, 'docx'));
}
