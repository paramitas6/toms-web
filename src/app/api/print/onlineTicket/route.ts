import { NextResponse } from "next/server";
import { fetchOrder } from "@/app/admin/_actions/orders";
import { ExtendedOrder } from "@/types/ExtendedOrder";

import { Printer, Image as EscposImage } from "@node-escpos/core";
import USB from "@node-escpos/usb-adapter";

import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";

// Extend dayjs with the advancedFormat plugin
dayjs.extend(advancedFormat);

/**
 * Format cents to currency string.
 * @param cents - The amount in cents.
 * @returns Formatted currency string.
 */
const formatCurrency = (cents: number): string => {
  return `$${(cents / 100).toFixed(2)}`;
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
    if ((currentLine + word).length > maxChars) {
      if (currentLine.length > 0) {
        lines.push(currentLine.trim());
        currentLine = "";
      }
    }
    currentLine += `${word} `;
  });

  if (currentLine.trim().length > 0) {
    lines.push(currentLine.trim());
  }

  return lines;
}

/**
 * Main handler function for the API route.
 * This function handles printing the ticket.
 */
export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const order: ExtendedOrder | null = await fetchOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Initialize printer
    const device = new USB(0x0483,0x5743);
    const printer = new Printer(device, { encoding: "GB18030" });

    await new Promise<void>((resolve, reject) => {
      device.open((err) => {
        if (err) {
          console.error("Failed to open device:", err);
          return reject(err);
        }

        (async () => {
          try {
            // Header
            printer
              .font("a")
              .align("CT")
              .style("B")
              .size(3, 3)
              .text("New Online Order")
              .style("NORMAL")
              .size(1, 1)
              .text("")
              .text("");

            // Delivery or Pickup
            printer
              .align("CT")
              .size(2, 2)
              .text((order.isDelivery ? "Delivery" : "Pickup")+" due:")
              .text("");

            // Due Date and Time using dayjs
            let dueDateTime = "N/A";
            if (order.deliveryDate && order.deliveryTime) {
              // Assuming order.deliveryTime is a string like "9AM - 11AM"
              const formattedDate = dayjs(order.deliveryDate).format("ddd MMM D");
              dueDateTime = `${formattedDate} ${order.deliveryTime}`;
            } else if (order.deliveryDate) {
              const formattedDate = dayjs(order.deliveryDate).format("ddd MMM D");
              dueDateTime = `${formattedDate} N/A`;
            } else if (order.deliveryTime) {
              dueDateTime = `N/A ${order.deliveryTime}`;
            }

            printer.text(`${dueDateTime}`).text("");

            // Invoice Number
            printer
              .align("LT")
              .size(1, 1)
              .text(`Invoice #: ${order.invoiceNumber || "N/A"}`)
              .text("");

            // Customer Name
            const guestName = order.guestName || order.user?.name || "Guest";
            printer.text(`Customer: ${guestName}`).text("");

            // Print Order Items
            printer
              .font("a")
              .align("LT")
              .style("B")
              .size(1, 1)
              .text("Order Items:")
              .style("NORMAL")
              .text("");

            order.orderItems.forEach((item, index) => {
              const itemDescription =
                item.description ||
                (item.product ? item.product.name : "Unnamed Product");
              const quantity = item.quantity;
              const price = formatCurrency(item.priceInCents);
              // const subtotal = formatCurrency(item.subtotalInCents);

              const line = `${index + 1}. ${itemDescription} x${quantity} - ${price} each`;
              const wrappedLines = wordWrap(line, 40);
              wrappedLines.forEach((wrappedLine) => {
                printer.text(wrappedLine);
              });
            });
            printer.text("");

            // Uncomment and adjust if you want to include total amount
            // const totalAmount = formatCurrency(order.pricePaidInCents);
            // printer
            //   .text("")
            //   .font("a")
            //   .align("RT")
            //   .style("B")
            //   .text(`Total: ${totalAmount}`)
            //   .style("NORMAL")
            //   .text("");

            // Footer
            printer.text("").text("").cut().close();

            console.log("Print job initiated successfully.");
            resolve();
          } catch (printErr) {
            console.error("Error during printing:", printErr);
            printer.close();
            reject(printErr);
          }
        })();
      });
    });

    return NextResponse.json(
      { status: "success", message: "Ticket printed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/print/ticket:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
