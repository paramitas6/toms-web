// src/app/api/print/receipt/route.ts

import { NextResponse } from "next/server";
import { fetchOrder } from "@/app/admin/_actions/orders";
import { join } from "path";

// Helper function to format currency


const formatCurrency = (cents: number): string => {
  return (cents / 100).toFixed(2);
};

// Main handler function for the API route
export async function POST(request: Request) {
  try {
    // Dynamically import the printer modules to avoid Webpack bundling issues
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
    const device = new USB(0x0483,0x5743);
    const printer = new Printer(device, { encoding: "GB18030" });
    const logoPath = join(process.cwd(), "public", "logobw.png");
    const image = await Image.load(logoPath);

    // Open the device and print the receipt
    await new Promise<void>((resolve, reject) => {
      device.open((err) => {
        if (err) {
          console.error("Failed to open device:", err);
          return reject(err);
        }

        (async () => {
          try {
            printer.font("a").align("CT").style("NORMAL").size(1, 1);
            // Add blank lines at the top to accommodate cutting space
            await printer.image(image);
            printer
              .size(1, 1)
              .text("572 Eglinton Ave W")
              .text("Toronto, ON M5N 1B7")
              .text("789952132RP0001")
              .text("--------------------------------")
              .text("Receipt")
              .text(`Order Date: ${new Date(order.createdAt).toLocaleString()}`)
              .text("--------------------------------");

            // Print each item in the order
            let tax = 0;
            order.orderItems.forEach((item) => {
              printer.text(
                `${item.description} x${item.quantity} - $${formatCurrency(
                  item.subtotalInCents
                )}`
              );
              tax += item.subtotalInCents;
            });
            tax = tax * 0.13;
            
            // Print total and add blank lines at the bottom for cutting space
            printer
              .text("--------------------------------")
              .text(`Subtotal: $${formatCurrency(order.pricePaidInCents)}`)
              .text(`13% HST: $${formatCurrency(tax)}`)
              .text(`Total: $${formatCurrency(order.pricePaidInCents + tax)}`)
              .text("")
              .text("")
              .text("Please keep this receipt for your records.")
              .text("Thank you for shopping with us.")
              .text("Enjoy the flowers!")
              .text("")
              .cut()
              .close();

            console.log("Receipt print job initiated successfully.");
            resolve();
          } catch (printErr) {
            console.error("Error during printing:", printErr);
            printer.close();
            reject(printErr);
          }
        })();
      });
    });

    // Return success response if printing was initiated successfully
    return NextResponse.json(
      { status: "success", message: "Receipt printed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/print/receipt:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
