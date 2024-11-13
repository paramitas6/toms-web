// src/app/api/print/delivery/route.ts

import { NextResponse } from "next/server";
import { fetchOrder } from "@/app/admin/_actions/orders";
import { Order as PrismaOrder, OrderItem } from "@prisma/client";
import { join } from "path";
import { Exo_2 } from "next/font/google";
// Define the Order type as used in Prisma with order items
interface Order extends PrismaOrder {
  orderItems: OrderItem[];
}

// Maximum characters per line (adjust based on your printer's specifications)
const MAX_CHARS_PER_LINE = 32;
const formatCurrency = (cents: number): string => {
  return (cents / 100).toFixed(2);
};
/**
 * Word wrap function to split a string into lines without breaking words.
 * @param text - The text to wrap.
 * @param maxChars - Maximum number of characters per line.
 * @returns An array of wrapped lines.
 */
function wordWrap(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    // If adding the next word exceeds the limit, push the current line and start a new one
    if ((currentLine + word).length > maxChars) {
      if (currentLine.length > 0) {
        lines.push(currentLine.trim());
        currentLine = "";
      }
    }
    currentLine += `${word} `;
  });

  // Push any remaining text
  if (currentLine.trim().length > 0) {
    lines.push(currentLine.trim());
  }

  return lines;
}

// Main handler function for the API route
export async function POST(request: Request) {
  try {
    // Dynamically import the modules to prevent Webpack from bundling them
    const { Printer, Image } = await import("@node-escpos/core");
    const USB = (await import("@node-escpos/usb-adapter")).default;

    // Parse JSON input and validate the presence of orderId
    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Fetch the order details
    const order = await fetchOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Initialize the USB device and printer
    const device = new USB();
    const printer = new Printer(device, { encoding: "GB18030" });

    const logoPath = join(process.cwd(), "public", "logobw.png");
    const image = await Image.load(logoPath);

    // Split the delivery address by commas and trim each part
    const addressLines = order.deliveryAddress
      ? order.deliveryAddress.split(",").map((line) => line.trim())
      : ["N/A"];

    device.open(async (err) => {
      if (err) {
        console.error("Failed to open device:", err);
        // Handle the error appropriately, possibly by sending a response or retrying
        return;
      }

      try {
        // Construct the Google Maps URL
        const mapsQuery = encodeURIComponent(order.deliveryAddress || "");
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

        // Start building the print job
        //await printer.image(image);
        printer.font("a").align("CT").style("NORMAL").size(1, 1);
        printer.text("Delivery Address:")


        // Print each line of the address with word wrapping

        addressLines.forEach((line) => {
          const wrappedLines = wordWrap(line, MAX_CHARS_PER_LINE);
          wrappedLines.forEach((wrappedLine) => {
            printer.size(2,2).text(` ${wrappedLine}`);
          });
        });
        // Postal Code
        if (order.postalCode) {
          const wrappedPostal = wordWrap(
            `${order.postalCode.toUpperCase()}`,
            MAX_CHARS_PER_LINE
          );
          wrappedPostal.forEach((line) => {
            printer.size(2,2).text(line);
          });
        } else {
          printer.size(2,2).text("Postal Code: N/A");
        }

        printer.text("")
        printer.size(1,1).text("Recipient:")
        // Recipient Name
        if (order.recipientName) {
          const wrappedRecipient = wordWrap(
            `${order.recipientName}`,
            MAX_CHARS_PER_LINE
          );
          wrappedRecipient.forEach((line) => {
            printer.size(2,2).text(line);
          });
        } else {
          printer.text("No Recipient Name");
        }

        // Recipient Phone
        if (order.recipientPhone) {
          const wrappedPhone = wordWrap(
            `${order.recipientPhone}`,
            MAX_CHARS_PER_LINE
          );
          wrappedPhone.forEach((line) => {
            printer.size(2,2).text(line);
          });
        } else {
          printer.text("Phone: N/A");
        }

        printer.text("")
        printer.size(1,1).text("Instructions/Buzzer:")
        // Delivery Instructions
        if (order.deliveryInstructions) {
          const wrappedInstructions = wordWrap(
            ` ${order.deliveryInstructions}`,
            MAX_CHARS_PER_LINE
          );
          wrappedInstructions.forEach((line) => {
            printer.text(line);
          });
        } else {
          printer.size(2,2).text("note/buzzer: N/A");
        }


        printer.text("")
        printer.size(1,1).text("Items:")
        order.orderItems.forEach((item) => {
          printer.size(2,2).text(
            `${item.description} x${item.quantity} `
          );
 
        });

        printer.size(1,1).text(""); // Add a blank line before the QR code

        // Await the QR code generation since it's asynchronous
        await printer.qrimage(mapsUrl, {
          type: "png", // Specify the QR code type if required
          mode: "dhdw", // Specify the QR code mode if required
          size: 4, // Adjust size as needed
        });

        // Continue with the remaining print commands after the QR code
        printer
        .text("")
          .cut() // Cut the paper
          .close(); // Close the printer connection

        console.log("Print job initiated successfully.");
      } catch (printErr) {
        console.error("Error during printing:", printErr);
        printer.close();
        // Optionally, handle the error by notifying the user or retrying
      }
    });

    // Return success response if printing was initiated successfully
    return NextResponse.json(
      { status: "success", message: "Delivery details printed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/print/delivery:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
