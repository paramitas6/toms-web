import { NextRequest, NextResponse } from "next/server";
import db from "@/db/db";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { jwtVerify } from "jose";
import generateInvoiceNumber from "@/lib/generateInvoiceNumber";
import { PrismaClientValidationError } from "@prisma/client/runtime/library";

const SECRET_KEY = new TextEncoder().encode(
  process.env.SECRET_KEY || "your_secret_key"
);

const orderSchema = z.object({
  cartItems: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().positive(),
      priceInCents: z.number().positive(),
      name: z.string(),
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
  userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { isGuest } = body;

    let userId: string | null = null;

    if (!isGuest) {
      const token = request.cookies.get("auth")?.value;

      if (token) {
        try {
          const { payload } = await jwtVerify(token, SECRET_KEY);
          userId = payload.userId as string;
        } catch (err) {
          console.error("JWT verification failed:", err);
          return NextResponse.json(
            { error: "Invalid authentication token." },
            { status: 401 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "Authentication token missing." },
          { status: 401 }
        );
      }
    }

    console.log("Received Order Data:", body); // Log received data for debugging

    const validationResult = orderSchema.safeParse({
      ...body,
      userId: userId || undefined,
    });

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
      isGuest: isGuestOrder,
      guestEmail,
      guestName,
      guestPhone,
      userId: extractedUserId,
    } = validationResult.data;

    if (deliveryOption === "delivery") {
      if (
        !recipientName ||
        !recipientPhone ||
        !deliveryAddress ||
        !postalCode
      ) {
        return NextResponse.json(
          { error: "Missing delivery details." },
          { status: 400 }
        );
      }
    }

    const idempotencyKey = `capture-${uuidv4()}`;

    const newOrder = await db.order.create({
      data: {
        pricePaidInCents: Math.round(totalAmount * 100),
        isDelivery: deliveryOption === "delivery",
        recipientName,

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
        guestEmail: isGuestOrder ? guestEmail || "" : null,
        guestName:  guestName,
        guestPhone: guestPhone,
        userId: !isGuestOrder ? extractedUserId : null,
        orderItems: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceInCents: item.priceInCents,
            subtotalInCents: item.priceInCents * item.quantity,
            description: item.name,
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

    // Call the print ticket API and handle response
    const printResponse = await fetch("http://localhost:3000/api/print/onlineTicket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: newOrder.id }),
    });

    if (!printResponse.ok) {
      const errorData = await printResponse.json();
      console.error("Error printing delivery details:", errorData.error);
    }

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
