import { NextRequest, NextResponse } from "next/server";
import db from "@/db/db";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import generateInvoiceNumber from "@/lib/generateInvoiceNumber";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const orderSchema = z.object({
  cartItems: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().positive(),
      priceInCents: z.number().positive(),
      name: z.string(),
      size: z.string(),
      type: z.enum(["custom", "product"]),
    })
  ),
  deliveryOption: z.enum(["pickup", "delivery"]),
  recipientName: z.string().optional(),
  recipientPhone: z.string().optional(),
  deliveryAddress: z.string().optional(),
  postalCode: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  selectedDate: z
    .string()
    .min(1, "Delivery date is required.")
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid delivery date format.",
    }),
  selectedTime: z.string().min(1, "Delivery time is required."),
  amountWithoutTax: z.number(),
  taxAmount: z.number(),
  deliveryFee: z.number(),
  totalAmount: z.number(),
  transactionId: z.string().optional(),
  secretToken: z.string(),
  isGuest: z.boolean(),
  guestEmail: z.union([z.string().email(), z.literal(""), z.null()]).optional(),
  guestName: z.string().optional(),
  guestPhone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    // Parse and validate the request body
    const validationResult = orderSchema.safeParse(body);

    if (!validationResult.success) {
      console.error(
        "Order validation failed:",
        validationResult.error.flatten()
      );
      return NextResponse.json(
        {
          error: "Invalid order data.",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      cartItems,
      deliveryOption,
      recipientName,
      recipientPhone,
      deliveryAddress,
      deliveryInstructions,
      postalCode,
      selectedDate,
      selectedTime,
      amountWithoutTax,
      taxAmount,
      deliveryFee,
      totalAmount,
      transactionId,
      isGuest,
      guestEmail,
      guestName,
      guestPhone,
    } = validationResult.data;

    // Validate delivery details for delivery option
    if (deliveryOption === "delivery") {
      if (!recipientName || !recipientPhone || !deliveryAddress || !postalCode) {
        return NextResponse.json(
          { error: "Missing delivery details." },
          { status: 400 }
        );
      }
    }

    // Determine userId for authenticated users or leave null for guests
    const userId = session ? session.user.id : null;

    // Check for missing guest details
    if (isGuest && (!guestEmail || !guestPhone)) {
      return NextResponse.json(
        { error: "Guest email and phone are required for guest orders." },
        { status: 400 }
      );
    }

    const idempotencyKey = `capture-${uuidv4()}`;

    // Create the order in the database
    const newOrder = await db.order.create({
      data: {
        pricePaidInCents: Math.round(totalAmount * 100),
        isDelivery: deliveryOption === "delivery",
        recipientName,
        category: "online",
        deliveryDate: new Date(selectedDate),
        deliveryTime: selectedTime,
        transactionId: transactionId,
        idempotencyKey,
        invoiceNumber: (
          await generateInvoiceNumber(uuidv4(), new Date())
        ).toString(),
        taxInCents: Math.round(taxAmount * 100),
        deliveryFeeInCents: Math.round(deliveryFee * 100),
        status: "payment pending",
        paymentMethod: "online card",
        transactionStatus: "pending",
        guestEmail: isGuest ? guestEmail : null,
        guestName: isGuest ? guestName : null,
        guestPhone: isGuest ? guestPhone : null,
        userId: isGuest ? null : userId, // Use userId for authenticated users, null for guests
        orderItems: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceInCents: item.priceInCents,
            subtotalInCents: item.priceInCents * item.quantity,
            description: item.name + " - " + item.size,
            type: item.type,
          })),
        },
        deliveryDetails:
          deliveryOption === "delivery"
            ? {
                create: {
                  recipientName,
                  recipientPhone,
                  deliveryAddress,
                  postalCode,
                  deliveryInstructions,
                  deliveryStatus: "Pending",
                  deliveryDate: new Date(selectedDate),
                  deliveryTime: selectedTime,
                },
              }
            : undefined,
      },
    });

    console.log(
      "Order created:",
      newOrder.id,
      "with Idempotency Key:",
      idempotencyKey
    );

    return NextResponse.json(
      { message: "Order processed successfully", orderId: newOrder.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing order:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
