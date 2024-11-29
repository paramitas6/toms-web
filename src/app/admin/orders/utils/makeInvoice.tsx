// src/app/admin/orders/utils/makeInvoice.tsx

import { PDFDocument, rgb, StandardFonts, PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit"; // Import fontkit

import { formatCurrency } from "@/lib/formatters";
import {
  Order as PrismaOrder,
  OrderItem,
  ProductVariant,
  Product,
} from "@prisma/client";

interface Order extends PrismaOrder {
  orderItems: (OrderItem & {
    product?: Product;
    ProductVariant?: ProductVariant;
  })[];
  deliveryDetails?: {
    recipientName?: string;
    recipientPhone?: string;
    deliveryAddress?: string;
    postalCode?: string;
    deliveryInstructions?: string;
    deliveryStatus?: string;
    deliveryDate?: Date;
    deliveryTime?: string;
  };
}

/**
 * Fetches font bytes from a given URL.
 * @param url The URL of the font file.
 * @returns A promise that resolves to the font's ArrayBuffer.
 */
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
    const robotoFontBytes = await fetchFont("/fonts/Roboto-Regular.ttf");
    const robotoBoldFontBytes = await fetchFont("/fonts/Roboto-Bold.ttf");
    const robotoFont = await pdfDoc.embedFont(robotoFontBytes);
    const robotoBoldFont = await pdfDoc.embedFont(robotoBoldFontBytes);
    const montserratFontBytes = await fetchFont("/fonts/Montserrat.ttf");

    const montserratFont = await pdfDoc.embedFont(montserratFontBytes);

    // Fetch and embed fonts
    const oSansFontBytes = await fetchFont(
      "/fonts/OpenSans-VariableFont_wdth,wght.ttf"
    );

    const oSansoFont = await pdfDoc.embedFont(oSansFontBytes);

    // Add a page
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points

    const { width, height } = page.getSize();
    const margin = 40;
    let yPosition = height - margin;

    // Draw Header
    const logoUrl = "/logow.png"; // Ensure this image exists in the public folder
    const logoImageBytes = await fetch(logoUrl).then((res) =>
      res.arrayBuffer()
    );
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
      "789952132RP0001",
      `Tom's Florist`,
      "572 Eglinton Ave West",
      "Toronto, ON M5N 1B6",
      "Tomsflorist@gmail.com",
      "(647)352-9188",
      
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

    // Order Details
    const orderDetails = [
      `Invoice #: ${order.invoiceNumber || order.id || "N/A"}`,
      `Order Date: ${parseDate(order.createdAt)}`,
      `Status: ${order.status || "N/A"}`,
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


    yPosition += 45;


    const customerDetails = [
      order.guestName || "N/A",
      order.guestEmail || "N/A",
      order.guestPhone || "N/A",
      order.deliveryDetails?.deliveryAddress || "N/A",
      order.deliveryDetails?.postalCode || "N/A",
    ];

    customerDetails.forEach((line) => {
      page.drawText(line, {
        x: companyDetailsX,
        y: yPosition,
        size: 12,
        font: robotoFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 15;
    });
    yPosition -= 30;
    // Items Table Header
    const tableHeaders = ["Item", "Quantity", "Price", "Subtotal"];
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
      for (const item of order.orderItems) {
        // Determine the item name, prioritizing ProductVariant if available
        let itemName = "N/A";
        if (item.ProductVariant) {
          itemName = `${item.product?.name || "Product"} - ${
            item.ProductVariant.size
          }`;
        } else if (item.product) {
          itemName = item.product.name;
        } else {
          itemName = item.description || "Item";
        }

        const quantity = item.quantity || 0;
        const pricePerUnit =
          quantity > 0 ? item.subtotalInCents / 100 / quantity : 0;
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
          throw new Error("Invoice is too long to fit on one page.");
        }
      }
    } else {
      page.drawText("No items", {
        x: tableColumnPositions[0],
        y: yPosition,
        size: 12,
        font: robotoFont,
        color: rgb(0, 0, 0),
      });
      page.drawText("-", {
        x: tableColumnPositions[1],
        y: yPosition,
        size: 12,
        font: robotoFont,
        color: rgb(0, 0, 0),
      });
      page.drawText("-", {
        x: tableColumnPositions[2],
        y: yPosition,
        size: 12,
        font: robotoFont,
        color: rgb(0, 0, 0),
      });
      page.drawText("-", {
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
    const taxAmount = order.taxInCents
      ? (order.taxInCents || 0) / 100
      : subtotalAmount * 0.13; // Default to 13% if tax is not explicitly set
    const totalAmount = subtotalAmount + taxAmount;

    const totals = [
      { label: "Subtotal:", amount: formatCurrency(subtotalAmount) },
      { label: "13% HST:", amount: formatCurrency(taxAmount) },
      { label: "Total:", amount: formatCurrency(totalAmount) },
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

    // Delivery Details (if applicable)
    if (order.isDelivery && order.deliveryDetails) {
      page.drawText("Delivery Details:", {
        x: margin,
        y: yPosition,
        size: 14,
        font: robotoFont,
        color: rgb(0, 0, 0),
      });

      yPosition -= 15;

      const deliveryDetails = [
        `Recipient Name: ${order.deliveryDetails.recipientName || "N/A"}`,
        `Recipient Phone: ${order.deliveryDetails.recipientPhone || "N/A"}`,
        `Address: ${order.deliveryDetails.deliveryAddress || "N/A"}`,
        `Postal Code: ${order.deliveryDetails.postalCode || "N/A"}`,
        `Delivery Date: ${parseDate(order.deliveryDetails.deliveryDate)}`,
        `Delivery Time: ${order.deliveryDetails.deliveryTime || "N/A"}`,
        `Instructions: ${order.deliveryDetails.deliveryInstructions || "N/A"}`,
        `Status: ${order.deliveryDetails.deliveryStatus || "N/A"}`,
      ];

      deliveryDetails.forEach((line) => {
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
    }

    // Notes (if any)
    if (order.notes) {
      page.drawText("Notes:", {
        x: margin,
        y: yPosition,
        size: 14,
        font: robotoFont,
        color: rgb(0, 0, 0),
      });

      yPosition -= 15;

      page.drawText(order.notes, {
        x: margin,
        y: yPosition,
        size: 12,
        font: robotoFont,
        color: rgb(0, 0, 0),
      });

      yPosition -= 15;
    }

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();

    // Trigger the browser to download the PDF document
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `Invoice-${order.invoiceNumber || order.id}.pdf`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    alert("Failed to generate invoice. Please try again.");
  }
};

/**
 * Helper function to safely parse dates.
 * @param date The date to parse.
 * @returns A formatted date string or 'N/A' if invalid.
 */
const parseDate = (date: Date | string | null | undefined): string => {
  if (!date) return "N/A";
  const parsedDate = new Date(date);
  return isNaN(parsedDate.getTime()) ? "N/A" : parsedDate.toLocaleDateString();
};
