// src/app/admin/orders/utils/makeInvoice.tsx

import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit'; // Import fontkit
import { Order } from '../types'; // Ensure the path is correct
import { formatCurrency } from '@/lib/formatters';

// Function to fetch font bytes
// Function to fetch font bytes
const fetchFont = async (url: string): Promise<ArrayBuffer> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch font from ${url}`);
    }
    return await response.arrayBuffer();
  };
/**
 * Generates a PDF invoice for a given order and triggers a download in the browser.
 *
 * @param {Order} order - The order data for which to generate the invoice.
 */
export const makeInvoice = async (order: Order): Promise<void> => {
  try {
    // Create a new PDFDocument
    const pdfDoc = await PDFDocument.create();
        // Register fontkit
        pdfDoc.registerFontkit(fontkit);

    // Fetch and embed fonts
    const robotoFontBytes = await fetchFont('/fonts/Roboto-Regular.ttf');
    const robotoBoldFontBytes = await fetchFont('/fonts/Roboto-Bold.ttf');
    const robotoFont = await pdfDoc.embedFont(robotoFontBytes);
    const robotoBoldFont = await pdfDoc.embedFont(robotoBoldFontBytes);

    // Add a page
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points

    const { width, height } = page.getSize();
    const margin = 40;
    let yPosition = height - margin;

    // Draw Header
    const logoUrl = '/logow.png'; // Ensure this image exists in the public folder
    const logoImageBytes = await fetch(logoUrl).then(res => res.arrayBuffer());
    const logoImage = await pdfDoc.embedPng(logoImageBytes);
    const logoDims = logoImage.scale(0.5);

    page.drawImage(logoImage, {
      x: margin,
      y: yPosition - logoDims.height,
      width: logoDims.width,
      height: logoDims.height,
    });

    // Company Details
    const companyDetails = [
      'Company Name',
      '1234 Street Address',
      'City, State, ZIP',
      'Email: info@company.com',
      'Phone: (123) 456-7890',
    ];

    const companyDetailsX = width - margin - 200;
    companyDetails.forEach((line, index) => {
      page.drawText(line, {
        x: companyDetailsX,
        y: yPosition - 15 * index,
        size: 10,
        font: robotoFont,
        color: rgb(0, 0, 0),
      });
    });

    yPosition -= logoDims.height + 20;

    // Divider Line
    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: width - margin, y: yPosition },
      thickness: 1,
      color: rgb(0.75, 0.75, 0.75),
    });

    yPosition -= 30;

    // Customer Details
    page.drawText('Invoice To:', {
      x: margin,
      y: yPosition,
      size: 14,
      font: robotoBoldFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 15;

    const customerDetails = [
      order.recipientName || 'N/A',
      order.deliveryAddress || 'N/A',
      order.postalCode || 'N/A',
      order.user?.email || 'N/A',
    ];

    customerDetails.forEach((line) => {
      page.drawText(line, {
        x: margin,
        y: yPosition,
        size: 12,
        font: robotoFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 15;
    });

    yPosition -= 10;

    // Order Details
    const orderDetails = [
      `Invoice #: ${order.id || 'N/A'}`,
      `Order Date: ${parseDate(order.createdAt)}`,
      `Status: ${order.status || 'N/A'}`,
    ];

    orderDetails.forEach((line) => {
      page.drawText(line, {
        x: margin,
        y: yPosition,
        size: 12,
        font: robotoFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 15;
    });

    yPosition -= 20;

    // Items Table Header
    const tableHeaders = ['Item', 'Quantity', 'Price', 'Subtotal'];
    const tableColumnPositions = [margin, 300, 400, 500];

    tableHeaders.forEach((header, index) => {
      page.drawText(header, {
        x: tableColumnPositions[index],
        y: yPosition,
        size: 12,
        font: robotoBoldFont,
        color: rgb(0, 0, 0),
      });
    });

    yPosition -= 15;

    // Divider Line
    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: width - margin, y: yPosition },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    yPosition -= 15;

    // Items Table Rows
    if (order.orderItems && order.orderItems.length > 0) {
      order.orderItems.forEach((item) => {
        const itemName =
          item.product?.name ||
          item.productId ||
          item.description ||
          'Item';
        const quantity = item.quantity || 0;
        const pricePerUnit =
          quantity > 0 ? (item.subtotalInCents / 100) / quantity : 0;
        const subtotal = (item.subtotalInCents || 0) / 100;

        page.drawText(itemName, {
          x: tableColumnPositions[0],
          y: yPosition,
          size: 12,
          font: robotoFont,
          color: rgb(0, 0, 0),
        });

        page.drawText(quantity.toString(), {
          x: tableColumnPositions[1],
          y: yPosition,
          size: 12,
          font: robotoFont,
          color: rgb(0, 0, 0),
        });

        page.drawText(formatCurrency(pricePerUnit), {
          x: tableColumnPositions[2],
          y: yPosition,
          size: 12,
          font: robotoFont,
          color: rgb(0, 0, 0),
        });

        page.drawText(formatCurrency(subtotal), {
          x: tableColumnPositions[3],
          y: yPosition,
          size: 12,
          font: robotoFont,
          color: rgb(0, 0, 0),
        });

        yPosition -= 15;

        // Check for page overflow
        if (yPosition < margin + 100) {
          // Add a new page if necessary
          // For simplicity, this example does not handle multi-page invoices
          throw new Error('Invoice is too long to fit on one page.');
        }
      });
    } else {
      page.drawText('No items', {
        x: tableColumnPositions[0],
        y: yPosition,
        size: 12,
        font: robotoFont,
        color: rgb(0, 0, 0),
      });
      page.drawText('-', {
        x: tableColumnPositions[1],
        y: yPosition,
        size: 12,
        font: robotoFont,
        color: rgb(0, 0, 0),
      });
      page.drawText('-', {
        x: tableColumnPositions[2],
        y: yPosition,
        size: 12,
        font: robotoFont,
        color: rgb(0, 0, 0),
      });
      page.drawText('-', {
        x: tableColumnPositions[3],
        y: yPosition,
        size: 12,
        font: robotoFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 15;
    }

    yPosition -= 20;

    // Totals Calculation
    const subtotalAmount = (order.pricePaidInCents || 0) / 100;
    const taxAmount = subtotalAmount * 0.13;
    const totalAmount = subtotalAmount + taxAmount;

    const totals = [
      { label: 'Subtotal:', amount: formatCurrency(subtotalAmount) },
      { label: 'Tax (13%):', amount: formatCurrency(taxAmount) },
      { label: 'Total:', amount: formatCurrency(totalAmount) },
    ];

    totals.forEach((total) => {
      page.drawText(total.label, {
        x: tableColumnPositions[2],
        y: yPosition,
        size: 12,
        font: robotoBoldFont,
        color: rgb(0, 0, 0),
      });

      page.drawText(total.amount, {
        x: tableColumnPositions[3],
        y: yPosition,
        size: 12,
        font: robotoBoldFont,
        color: rgb(0, 0, 0),
      });

      yPosition -= 15;
    });

    yPosition -= 30;

    // Footer
    page.drawText('Thank you for your business!', {
      x: margin,
      y: margin,
      size: 12,
      font: robotoFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();

    // Trigger the browser to download the PDF document
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `Invoice-${order.id}.pdf`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    alert('Failed to generate invoice. Please try again.');
  }
};

// Helper function to safely parse dates
const parseDate = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';
  const parsedDate = new Date(date);
  return isNaN(parsedDate.getTime()) ? 'N/A' : parsedDate.toLocaleDateString();
};
