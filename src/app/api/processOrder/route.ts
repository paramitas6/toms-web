// src/app/api/processOrder/route.ts

import { NextRequest, NextResponse } from 'next/server';
import db from '@/db/db';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { jwtVerify } from 'jose'; // Ensure you have 'jose' installed

const SECRET_KEY = new TextEncoder().encode(process.env.SECRET_KEY || 'your_secret_key');

const orderSchema = z.object({
  cartItems: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().positive(),
      priceInCents: z.number().positive(),
      name: z.string(),
    })
  ),
  deliveryOption: z.enum(["pickup", "delivery"]),
  recipientName: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  postalCode: z.string().optional(),
  selectedDate: z.string().min(1, "Delivery date is required."),
  selectedTime: z.string().min(1, "Delivery time is required."),
  amountWithoutTax: z.number(),
  taxAmount: z.number(),
  deliveryFee: z.number(),
  totalAmount: z.number(),
  transactionId: z.string().optional(),
  secretToken: z.string(),
  isGuest: z.boolean(),
  guestEmail: z.union([z.string().email(), z.literal(''), z.null()]).optional(),
  userId: z.string().optional(), // Add userId as optional
});

export async function POST(request: NextRequest) {
  try {
    // Extract JWT from 'auth' cookie
    const token = request.cookies.get('auth')?.value;
    let userId: string | null = null;

    if (token) {
      try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        userId = payload.userId as string;
      } catch (err) {
        console.error('JWT verification failed:', err);
        // Optionally, you can return an error or treat as guest
      }
    }

    const body = await request.json();
    const validationResult = orderSchema.safeParse({ ...body, userId: userId || undefined });

    if (!validationResult.success) {
      console.error('Order validation failed:', validationResult.error);
      return NextResponse.json({ error: 'Invalid order data.' }, { status: 400 });
    }

    const {
      cartItems,
      deliveryOption,
      recipientName,
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
      userId: extractedUserId,
    } = validationResult.data;

    // If not a guest and userId is not present, return an error
    if (!isGuest && !extractedUserId) {
      return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
    }

    const idempotencyKey = `capture-${uuidv4()}`;

    const newOrder = await db.order.create({
      data: {
        pricePaidInCents: Math.round(totalAmount * 100),
        isDelivery: deliveryOption === 'delivery',
        recipientName,
        deliveryAddress,
        deliveryInstructions,
        postalCode,
        deliveryDate: new Date(selectedDate),
        deliveryTime: selectedTime,
        transactionId: transactionId,
        idempotencyKey,
        deliveryFeeInCents: Math.round(deliveryFee * 100),
        status: "payment pending",
        guestEmail: isGuest ? (guestEmail || '') : null, // Only set if guest
        userId: !isGuest ? extractedUserId : null, // Only set if authenticated
        orderItems: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceInCents: item.priceInCents,
            subtotalInCents: item.priceInCents * item.quantity,
            description: item.name,
          })),
        },
      },
    });

    console.log('Order created:', newOrder.id, 'with Idempotency Key:', idempotencyKey);

    return NextResponse.json({ message: 'Order processed successfully', orderId: newOrder.id }, { status: 201 });
  } catch (error) {
    console.error('Error processing order:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
