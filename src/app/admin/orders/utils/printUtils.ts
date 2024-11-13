// import { Printer, Image } from "@node-escpos/core";
// import USB from "@node-escpos/usb-adapter";
// import { join } from "path";
// import { Order as PrismaOrder, OrderItem } from "@prisma/client";

// interface Order extends PrismaOrder {
//   orderItems: OrderItem[];
// }

// // Initialize the USB device
// const device = new USB();

// // Initialize the printer with desired options
// const options = { encoding: "GB18030" }; // Adjust encoding if needed
// const printer = new Printer(device, options);

// /**
//  * Formats currency from cents to dollars.
//  * @param cents - The amount in cents.
//  * @returns The formatted dollar string.
//  */
// const formatCurrency = (cents: number): string => {
//   return (cents / 100).toFixed(2);
// };

// /**
//  * Prints the receipt for an order.
//  * @param order - The order to print.
//  */
// export const printReceipt = async (order: Order): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     device.open(async (err) => {
//       if (err) {
//         console.error("Failed to open device:", err);
//         return reject(new Error("Failed to open device."));
//       }

//       try {
//         printer
//           .font("a")
//           .align("CT")
//           .style("NORMAL")
//           .size(1, 1)
//           .text("Store Name")
//           .text("Address Line 1")
//           .text("Address Line 2")
//           .text("--------------------------------")
//           .text(`Order ID: ${order.id}`)
//           .text(`Date: ${new Date(order.createdAt).toLocaleString()}`)
//           .text("--------------------------------");

//         order.orderItems.forEach((item) => {
//           printer.text(`${item.description} x${item.quantity} - $${formatCurrency(item.subtotalInCents)}`);
//         });

//         printer
//           .text("--------------------------------")
//           .text(`Total: $${formatCurrency(order.pricePaidInCents)}`)
//           .cut()
//           .close();

//         resolve();
//       } catch (printErr) {
//         console.error("Error during printing:", printErr);
//         printer.close();
//         reject(new Error("Error during receipt printing."));
//       }
//     });
//   });
// };

// /**
//  * Prints the delivery details for an order.
//  * @param order - The order containing delivery details.
//  */
// export const printDeliveryDetails = async (order: Order): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     device.open(async (err) => {
//       if (err) {
//         console.error("Failed to open device:", err);
//         return reject(new Error("Failed to open device."));
//       }

//       try {
//         printer
//           .font("a")
//           .align("CT")
//           .style("NORMAL")
//           .size(1, 1)
//           .text("Delivery Details")
//           .text("--------------------------------")
//           .text(`Recipient: ${order.recipientName || "N/A"}`)
//           .text(`Phone: ${order.recipientPhone || "N/A"}`)
//           .text(`Address: ${order.deliveryAddress || "N/A"}`)
//           .text(`Postal Code: ${order.postalCode || "N/A"}`)
//           .text(`Instructions: ${order.deliveryInstructions || "N/A"}`)
//           .cut()
//           .close();

//         resolve();
//       } catch (printErr) {
//         console.error("Error during printing:", printErr);
//         printer.close();
//         reject(new Error("Error during delivery details printing."));
//       }
//     });
//   });
// };
