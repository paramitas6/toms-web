// /app/api/getOrderDetails/route.ts

import { NextRequest, NextResponse } from 'next/server';
import db from '@/db/db'; // Ensure this path points to your Prisma client instance
import { z } from 'zod';

/**
 * Schema Validation using Zod
 */
const getOrderDetailsSchema = z.object({
  orderId: z.string().uuid(),
});

/**
 * GET Handler for /api/getOrderDetails
 */
export async function GET(request: NextRequest) {
  console.log('Received GET request to /api/getOrderDetails.');

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    console.log('Query Parameter - orderId:', orderId);

    // Validate presence of orderId
    if (!orderId) {
      console.error('Missing orderId in query parameters.');
      return NextResponse.json(
        { error: 'Missing orderId in query parameters.' },
        { status: 400 }
      );
    }

    // Validate orderId format using Zod
    const validationResult = getOrderDetailsSchema.safeParse({ orderId });

    if (!validationResult.success) {
      console.error('Invalid orderId format:', validationResult.error);
      return NextResponse.json(
        { error: 'Invalid orderId format. Must be a valid UUID.' },
        { status: 400 }
      );
    }

    // Fetch order from the database, including orderItems, Products, and Images
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                images: {
                  select: {
                    imagePath: true,
                  },
                  take: 1, // Fetch only the first image
                },
              },
            },
          },
        },
        // Include other related data if necessary, e.g., user details
      },
    });

    console.log('Fetched Order:', order);

    // If order not found, return 404
    if (!order) {
      console.error('Order not found for orderId:', orderId);
      return NextResponse.json(
        { error: 'Order not found.' },
        { status: 404 }
      );
    }

    // Prepare the order details to return, including image paths
    const orderDetails = {
      id: order.id,
      pricePaidInCents: order.pricePaidInCents,
      isDelivery: order.isDelivery,
      recipientName: order.recipientName,
      deliveryAddress: order.deliveryAddress,
      deliveryInstructions: order.deliveryInstructions,
      postalCode: order.postalCode,
      deliveryDate: order.deliveryDate,
      deliveryTime: order.deliveryTime,
      deliveryFeeInCents: order.deliveryFeeInCents,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      orderItems: order.orderItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        description: item.description,
        quantity: item.quantity,
        subtotalInCents: item.subtotalInCents,
        cardMessage: item.cardMessage,
        imagePath: item.product?.imagePath || null, // Include the first image path or null
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      // Include other fields as needed
    };

    console.log('Order Details to Return:', orderDetails);

    // Return the order details as JSON
    return NextResponse.json(orderDetails);
  } catch (error) {
    console.error('Error fetching order details:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
