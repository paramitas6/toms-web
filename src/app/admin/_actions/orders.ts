// src\app\admin\_actions\orders.ts
"use server";

import db from "@/db/db";
import { z } from "zod";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { v4 as uuid } from "uuid";
import { User, Order } from "@prisma/client";

import crypto from "crypto";

async function generateRandomInvoiceNumber(
  orderId: string,
  createdAt: Date
): Promise<string> {
  const input = `${orderId}-${createdAt.getTime()}`;
  const hash = crypto.createHash("sha256").update(input).digest("hex");
  const hashInteger = parseInt(hash.slice(0, 9), 16);
  return Number(hashInteger % 1e9)
    .toString()
    .padStart(9, "0");
}

const orderItemSchema = z.object({
  productId: z.string().uuid().optional(),
  priceInCents: z
    .union([z.coerce.number().int().min(1), z.literal(null)])
    .nullable(),
  quantity: z.coerce.number().int().min(1),
  type: z.string().min(1), // Add type property
  description: z.string().optional(), // For custom items
});

const addOrderSchema = z.object({
  userId: z.string().uuid().optional(),
  isDelivery: z.coerce.boolean(),
  status: z.string().min(1),
  recipientName: z.string().optional(),
  recipientPhone: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
  deliveryDate: z.string().optional(),
  deliveryTime: z.string().optional(),
  orderItems: z.array(orderItemSchema),
});

/**
 * Capture Transaction and Update Order
 * This function captures a pre-auth payment and updates the transactionStatus to "Paid"
 */
const captureTransactionSchema = z.object({
  orderId: z.string(),
  transactionId: z.string().optional(),
  amount: z.number().positive(),
});

export async function captureTransaction(orderId: string) {
  const ipAddress = "192.168.1.1";
  const apiToken = process.env.HELCIM_API_TOKEN;

  try {
    // Fetch the order from the database to get the transactionId and amount
    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (
      !order ||
      !order.transactionId ||
      !order.idempotencyKey ||
      !order.pricePaidInCents
    ) {
      throw new Error("Order not found or transactionId/amount missing.");
    }

    const transactionId = order.transactionId;
    const amount = order.pricePaidInCents / 100; // Convert cents to dollars
    const idempotencyKey = order.idempotencyKey.slice(0, 25);
    const response = await fetch("https://api.helcim.com/v2/payment/capture", {
      method: "POST",
      headers: new Headers({
        accept: "application/json",
        "content-type": "application/json",
        "idempotency-key": idempotencyKey,
        "api-token": apiToken || "",
      }),
      body: JSON.stringify({
        amount,
        ipAddress,
        preAuthTransactionId: transactionId,
      }),
    });

    const result = await response.json();

    if (result.status === "APPROVED") {
      await db.order.update({
        where: { id: orderId },
        data: {
          transactionStatus: "Paid",
          idempotencyKey,
        },
      });
      console.log(
        `Transaction captured successfully) ${JSON.stringify(result)}`
      );
    } else {
      throw new Error(`Transaction capture failed: ${JSON.stringify(result)}`);
    }
  } catch (error) {
    console.error("Error capturing transaction:", error);
    throw new Error("Transaction capture failed.");
  }
}

export async function addOrder(prevState: unknown, formData: FormData) {
  const entries = Object.fromEntries(formData.entries());

  // Parse orderItems
  const orderItemsEntries = Object.entries(entries).filter(([key]) =>
    key.startsWith("orderItems[")
  );

  // Reconstruct orderItems array
  const orderItemsMap: { [index: string]: any } = {};
  for (const [key, value] of orderItemsEntries) {
    const match = key.match(/orderItems\[(\d+)\]\[(.+)\]/);
    if (match) {
      const index = match[1];
      const field = match[2];
      if (!orderItemsMap[index]) {
        orderItemsMap[index] = {};
      }
      orderItemsMap[index][field] = value;
    }
  }

  const orderItems = Object.values(orderItemsMap);

  // Combine entries with orderItems
  const data = {
    ...entries,
    orderItems,
    isDelivery: entries.isDelivery === "true", // Ensure isDelivery is a boolean
  };

  const result = addOrderSchema.safeParse(data);
  if (!result.success) {
    console.log("Error in addOrderSchema :", result.error);
    return result.error.formErrors.fieldErrors;
  }

  const {
    userId,
    isDelivery,
    status,
    recipientName,
    deliveryAddress,
    deliveryInstructions,
    postalCode,
    notes,
    deliveryDate,
    deliveryTime,
    orderItems: orderItemsData,
    recipientPhone: recipientPhone,
  } = result.data;

  // Calculate total price
  let pricePaidInCents = 0;

  const orderItemsToCreate = [];
  for (const itemData of orderItemsData) {
    if (itemData.productId) {
      const product = await db.product.findUnique({
        where: { id: itemData.productId },
      });
      if (!product) {
        console.warn(
          `Product with ID ${itemData.productId} not found. Skipping.`
        );
        continue; // Skip invalid products
      }

      const subtotalInCents = product.priceInCents * itemData.quantity;
      pricePaidInCents += subtotalInCents;

      orderItemsToCreate.push({
        productId: product.id,
        quantity: itemData.quantity,
        subtotalInCents,
        priceInCents: product.priceInCents,
        type: "product",
      });
    } else {
      // Handle custom order items
      if (!itemData.priceInCents) {
        console.warn("Custom order item missing priceInCents. Skipping.");
        continue; // Skip items without price
      }

      const subtotalInCents = itemData.priceInCents * itemData.quantity;
      pricePaidInCents += subtotalInCents;
      orderItemsToCreate.push({
        productId: null,
        quantity: itemData.quantity,
        subtotalInCents,
        priceInCents: itemData.priceInCents,
        type: itemData.type || "custom",
        description: itemData.description || "",
      });
    }
  }
  pricePaidInCents = pricePaidInCents * 1.13; // Add 13% tax
  // Create the order
  const newOrder = await db.order.create({
    data: {
      userId,
      pricePaidInCents,
      isDelivery,
      recipientName,
      recipientPhone,
      deliveryAddress,
      deliveryInstructions,
      postalCode,
      notes,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      deliveryTime,
      status,
      orderItems: {
        create: orderItemsToCreate,
      },
    },
  });

  // Step 2: Generate the invoice number
  const invoiceNumber = await generateRandomInvoiceNumber(
    newOrder.id,
    newOrder.createdAt
  );

  // Step 3: Update the order with the generated invoice number
  const updatedOrder = await db.order.update({
    where: { id: newOrder.id },
    data: { invoiceNumber },
  });

  // Revalidate and redirect
  revalidatePath("/admin/orders");
  redirect("/admin/orders");
  return updatedOrder;
}

const editOrderSchema = addOrderSchema;

export async function updateOrder(
  id: string,
  prevState: unknown,
  formData: FormData
) {
  const entries = Object.fromEntries(formData.entries());

  // Parse orderItems
  const orderItemsEntries = Object.entries(entries).filter(([key]) =>
    key.startsWith("orderItems[")
  );

  // Reconstruct orderItems array
  const orderItemsMap: { [index: string]: any } = {};
  for (const [key, value] of orderItemsEntries) {
    const match = key.match(/orderItems\[(\d+)\]\[(.+)\]/);
    if (match) {
      const index = match[1];
      const field = match[2];
      if (!orderItemsMap[index]) {
        orderItemsMap[index] = {};
      }
      orderItemsMap[index][field] = value;
    }
  }

  const orderItems = Object.values(orderItemsMap);

  // Combine entries with orderItems
  const data = {
    ...entries,
    orderItems,
  };

  const result = editOrderSchema.safeParse(data);
  if (!result.success) {
    return result.error.formErrors.fieldErrors;
  }

  const {
    userId,
    isDelivery,
    status,
    recipientName,
    deliveryAddress,
    deliveryInstructions,
    postalCode,
    notes,
    deliveryDate,
    deliveryTime,
    orderItems: orderItemsData,
  } = result.data;

  // Calculate total price
  let pricePaidInCents = 0;
  const orderItemsToCreate = [];
  for (const itemData of orderItemsData) {
    if (itemData.productId) {
      const product = await db.product.findUnique({
        where: { id: itemData.productId },
      });
      if (!product) {
        console.warn(
          `Product with ID ${itemData.productId} not found. Skipping.`
        );
        continue; // Skip invalid products
      }

      const subtotalInCents = product.priceInCents * itemData.quantity;
      pricePaidInCents += subtotalInCents;

      orderItemsToCreate.push({
        productId: product.id,
        quantity: itemData.quantity,
        subtotalInCents,
        priceInCents: product.priceInCents,
        type: "product",
      });
    } else {
      // Handle custom order items
      if (!itemData.priceInCents) {
        console.warn("Custom order item missing priceInCents. Skipping.");
        continue; // Skip items without price
      }

      const subtotalInCents = itemData.priceInCents * itemData.quantity;
      pricePaidInCents += subtotalInCents;

      orderItemsToCreate.push({
        productId: null,
        quantity: itemData.quantity,
        subtotalInCents,
        priceInCents: itemData.priceInCents,
        type: itemData.type || "custom",
        description: itemData.description || "",
      });
    }
  }

  // Update the order
  await db.order.update({
    where: { id },
    data: {
      userId,
      pricePaidInCents,
      isDelivery,
      recipientName,
      deliveryAddress,
      deliveryInstructions,
      postalCode,
      notes,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      deliveryTime,
      status,
    },
  });

  // Delete existing order items and recreate them
  await db.orderItem.deleteMany({
    where: { orderId: id },
  });

  await db.orderItem.createMany({
    data: orderItemsToCreate.map((item) => ({
      ...item,
      orderId: id,
      priceInCents: item.priceInCents,
    })),
  });

  // Revalidate and redirect
  revalidatePath("/admin/orders");
  redirect("/admin/orders");
}

export async function deleteOrder(id: string) {
  await db.order.delete({
    where: { id },
  });

  revalidatePath("/admin/orders");
  redirect("/admin/orders");
}
export async function changeOrderStatus(id: string, newStatus: string) {
  const validStatuses = [
    "payment pending",
    "in progress",
    "ready to be picked up",
    "picked up",
  ];

  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }

  const order = await db.order.update({
    where: { id },
    data: { status: newStatus },
  });

  if (!order) {
    return notFound();
  }

  // Revalidate relevant paths and redirect
  revalidatePath("/admin/orders");
  redirect("/admin/orders");
}

export async function fetchOrder(id: string) {
  const order = await db.order.findUnique({
    where: { id },
    include: {
      orderItems: {
        include: { product: true }, // Include related product details
      },
    },
  });

  if (!order) {
    notFound(); // Handle case where order is not found
  }

  return order;
}

export async function fetchTransactionStatus(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { transactionStatus: true, isDelivery: true },
  });

  if (!order) {
    throw new Error("Order not found.");
  }

  return order;
}

export async function fetchUsers(): Promise<User[]> {
  return await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Fetch orders, optionally filtered by customer ID.
 * @param customerId - Optional customer ID to filter orders.
 */
export async function fetchOrders(customerId?: string): Promise<Order[]> {
  const whereClause = customerId ? { userId: customerId } : {};
  return await db.order.findMany({
    where: whereClause,
    include: {
      user: true,
      orderItems: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Fetch detailed information about a single user.
 * @param userId - The ID of the user to fetch.
 */
export async function fetchUserById(userId: string): Promise<User | null> {
  return await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Fetch detailed information about a single order.
 * @param orderId - The ID of the order to fetch.
 */
export async function fetchOrderById(orderId: string): Promise<Order | null> {
  return await db.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });
}
