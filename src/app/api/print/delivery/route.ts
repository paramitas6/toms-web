import { NextResponse } from "next/server";
import { fetchOrder } from "@/app/admin/_actions/orders";
import { ExtendedOrder } from "@/types/ExtendedOrder";
import { join } from "path";
import { Printer, Image as EscposImage } from "@node-escpos/core";
import USB from "@node-escpos/usb-adapter";

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

// Main handler function for the API route
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

    const device = new USB(0x0483,0x5743);
    const printer = new Printer(device, { encoding: "GB18030" });

    const logoPath = join(process.cwd(), "public", "logobw.png");
    const escposImage = await EscposImage.load(logoPath);

    const addressLines = order.deliveryDetails?.deliveryAddress
      ? order.deliveryDetails.deliveryAddress
          .split(",")
          .map((line) => line.trim())
      : ["N/A"];

    await new Promise<void>((resolve, reject) => {
      device.open((err) => {
        if (err) {
          console.error("Failed to open device:", err);
          return reject(err);
        }

        (async () => {
          try {
            const mapsQuery = encodeURIComponent(order.deliveryDetails?.deliveryAddress || "");
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

            printer.font("a").align("CT").style("NORMAL").size(1, 1);
            // Uncomment if you want to print the logo
            // await printer.image(escposImage);

            printer.text("Delivery Address:");

            addressLines.forEach((line) => {
              const wrappedLines = wordWrap(line, 32);
              wrappedLines.forEach((wrappedLine) => {
                printer.size(2, 2).text(` ${wrappedLine}`);
              });
            });

            if (order.deliveryDetails?.postalCode) {
              const wrappedPostal = wordWrap(
                `${order.deliveryDetails.postalCode.toUpperCase()}`,
                32
              );
              wrappedPostal.forEach((line) => {
                printer.size(2, 2).text(line);
              });
            } else {
              printer.size(2, 2).text("Postal Code: N/A");
            }

            printer.text("");
            printer.size(1, 1).text("Recipient:");
            if (order.deliveryDetails?.recipientName) {
              const wrappedRecipient = wordWrap(
                `${order.deliveryDetails.recipientName}`,
                32
              );
              wrappedRecipient.forEach((line) => {
                printer.size(2, 2).text(line);
              });
            } else {
              printer.text("No Recipient Name");
            }

            if (order.deliveryDetails?.recipientPhone) {
              const wrappedPhone = wordWrap(
                `${order.deliveryDetails.recipientPhone}`,
                32
              );
              wrappedPhone.forEach((line) => {
                printer.size(2, 2).text(line);
              });
            } else {
              printer.text("Phone: N/A");
            }

            printer.text("");
            printer.size(1, 1).text("Instructions/Buzzer:");
            if (order.deliveryDetails?.deliveryInstructions) {
              const wrappedInstructions = wordWrap(
                `${order.deliveryDetails.deliveryInstructions}`,
                32
              );
              wrappedInstructions.forEach((line) => {
                printer.text(line);
              });
            } else {
              printer.size(2, 2).text("note/buzzer: N/A");
            }

            printer.text("");
            printer.size(1, 1).text("Items:");
            order.orderItems.forEach((item) => {
              const itemDescription =
                item.description ||
                (item.product ? item.product.name : "Unnamed Product");
              printer.size(2, 2).text(`${itemDescription} x${item.quantity}`);
            });

            printer.text("");
            await printer.qrimage(mapsUrl, {
              type: "png",
              mode: "dhdw",
              size: 4,
            });

            printer.text("").cut().close();

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
      { status: "success", message: "Delivery details printed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/print/delivery:", error);
    return NextResponse.json(
      { error: "Failed to print delivery details" },
      { status: 500 }
    );
  }
}
