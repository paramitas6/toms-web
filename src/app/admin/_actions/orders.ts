// src/app/admin/_actions/orders.ts
"use server";

import db from "@/db/db";
import { z } from "zod";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { v4 as uuid } from "uuid";
import { User, Order } from "@prisma/client";
import crypto from "crypto";
import { ExtendedOrder } from "@/types/ExtendedOrder";
import dayjs from "dayjs";



/**
 * Generates a random 9-digit invoice number based on the order ID and creation time.
 * @param orderId - The ID of the order.
 * @param createdAt - The creation date of the order.
 * @returns A 9-digit invoice number as a string.
 */
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

// Updated OrderItem Schema to include new fields
const orderItemSchema = z.object({
  productId: z.string().uuid().optional(),
  priceInCents: z
    .union([z.coerce.number().int().min(1), z.literal(null)])
    .nullable(),
  quantity: z.coerce.number().int().min(1),
  type: z.string().min(1), // "product" or "custom"
  description: z.string().optional(), // For custom items
  cardMessage: z.string().optional(), // Personalized card message
});

// Updated Add Order Schema to include new fields
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
  deliveryFeeInCents: z.coerce.number().int().optional(), // Add delivery fee
  deliveryDate: z.string().optional(),
  deliveryTime: z.string().optional(),
  guestEmail: z.string().email().optional(), // New field
  guestName: z.string().optional(), // New field
  paymentMethod: z.string().optional(), // New field
  transactionId: z.string().optional(), // New field
  idempotencyKey: z.string().optional(), // New field
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
        `Transaction captured successfully: ${JSON.stringify(result)}`
      );
    } else {
      throw new Error(`Transaction capture failed: ${JSON.stringify(result)}`);
    }
  } catch (error) {
    console.error("Error capturing transaction:", error);
    throw new Error("Transaction capture failed.");
  }
}

/**
 * Adds a new order to the database along with associated order items and delivery details.
 * @param prevState - Previous state (not used here).
 * @param formData - Form data containing order details.
 * @returns The newly created order.
 */
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
    deliveryFeeInCents,
    recipientName,
    deliveryAddress,
    deliveryInstructions,
    postalCode,
    notes,
    deliveryDate,
    deliveryTime,
    orderItems: orderItemsData,
    recipientPhone,
    guestEmail,
    guestName,
    paymentMethod,
    transactionId,
    idempotencyKey,
  } = result.data;

  // **Set Default deliveryDate and deliveryTime if not provided**
  const finalDeliveryDate = deliveryDate
    ? dayjs(deliveryDate).startOf("day").toDate()
    : dayjs().startOf("day").toDate(); // Defaults to today's date

  const finalDeliveryTime = deliveryTime
    ? deliveryTime
    : dayjs()
        .add(1, "minute") // Add one minute to ensure it's the next minute
        .second(0) // Zero out seconds
        .millisecond(0) // Zero out milliseconds
        .format("h:mm A"); // Format as HH:mm



  // **Calculate subtotal from order items**
  let subtotalInCents = 0;
  const orderItemsToCreate: any[] = [];
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

      const subtotal = product.priceInCents * itemData.quantity;
      subtotalInCents += subtotal;

      orderItemsToCreate.push({
        productId: product.id,
        quantity: itemData.quantity,
        subtotalInCents: subtotal,
        priceInCents: product.priceInCents,
        type: "product",
        cardMessage: itemData.cardMessage || "",
      });
    } else {
      // Handle custom order items
      if (!itemData.priceInCents) {
        console.warn("Custom order item missing priceInCents. Skipping.");
        continue; // Skip items without price
      }

      const subtotal = itemData.priceInCents * itemData.quantity;
      subtotalInCents += subtotal;
      orderItemsToCreate.push({
        productId: null,
        quantity: itemData.quantity,
        subtotalInCents: subtotal,
        priceInCents: itemData.priceInCents,
        type: itemData.type || "custom",
        description: itemData.description || "",
        cardMessage: itemData.cardMessage || "",
      });
    }
  }

  // **Calculate tax**
  const includeTax = true; // Adjust based on your business logic or make it dynamic
  const taxInCents = includeTax ? Math.round(subtotalInCents * 0.13) : 0;


  // **Calculate total price**
  const pricePaidInCents = subtotalInCents + taxInCents;

  // **Create the order along with delivery details if applicable**
  const newOrder = await db.order.create({
    data: {
      userId,
      pricePaidInCents,
      deliveryFeeInCents, // Add delivery fee if applicable
      taxInCents,
      isDelivery,
      status,
      guestEmail,
      guestName,
      paymentMethod,
      transactionId,
      idempotencyKey,
      notes,
      deliveryDate: finalDeliveryDate,
      deliveryTime: finalDeliveryTime,
      orderItems: {
        create: orderItemsToCreate,
      },
      deliveryDetails: isDelivery
        ? {
            create: {
              recipientName,
              recipientPhone,
              deliveryAddress,
              deliveryInstructions,
              deliveryStatus: "Pending", // Default status
              deliveryDate: finalDeliveryDate,
              deliveryTime: finalDeliveryTime,
            },
          }
        : undefined,
    },
  });

  // **Generate the invoice number**
  const invoiceNumber = await generateRandomInvoiceNumber(
    newOrder.id,
    newOrder.createdAt
  );

  // **Update the order with the generated invoice number**
  const updatedOrder = await db.order.update({
    where: { id: newOrder.id },
    data: { invoiceNumber },
  });

  // **Revalidate and redirect**
  revalidatePath("/admin/orders");
  redirect("/admin/orders");
  return updatedOrder;
}

// Reuse addOrderSchema for editing orders, but you can define a separate schema if needed
const editOrderSchema = addOrderSchema;

/**
 * Updates an existing order and its associated delivery details.
 * @param id - The ID of the order to update.
 * @param prevState - Previous state (not used here).
 * @param formData - Form data containing updated order details.
 */
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
    isDelivery: entries.isDelivery === "true", // Ensure isDelivery is a boolean
  };

  const result = editOrderSchema.safeParse(data);
  if (!result.success) {
    console.log("Error in editOrderSchema :", result.error);
    return result.error.formErrors.fieldErrors;
  }

  const {
    userId,
    isDelivery,
    status,
    recipientName,
    deliveryFeeInCents,
    deliveryAddress,
    deliveryInstructions,
    postalCode,
    notes,
    deliveryDate,
    deliveryTime,
    orderItems: orderItemsData,
    recipientPhone,
    guestEmail,
    guestName,
    paymentMethod,
    transactionId,
    idempotencyKey,
  } = result.data;

  // Calculate total price
  let pricePaidInCents = 0;
  const orderItemsToCreate: any[] = [];
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
        cardMessage: itemData.cardMessage || "",
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
        cardMessage: itemData.cardMessage || "",
      });
    }
  }

  pricePaidInCents = Math.round(pricePaidInCents * 1.13); // Add 13% tax and round

  // Update the order
  const updatedOrder = await db.order.update({
    where: { id },
    data: {
      userId,
      pricePaidInCents,
      isDelivery,
      status,
      guestEmail,
      guestName,
      paymentMethod,
      transactionId,
      idempotencyKey,
      notes,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      deliveryTime,
      // Update deliveryDetails if isDelivery is true
      deliveryDetails: isDelivery
        ? {
            upsert: {
              update: {
                recipientName,
                recipientPhone,
                deliveryAddress,
                deliveryInstructions,
                deliveryStatus: "Pending", // Or another logic to set status
                deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
                deliveryTime,
              },
              create: {
                recipientName,
                recipientPhone,
                deliveryAddress,
                deliveryInstructions,
                deliveryStatus: "Pending",
                deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
                deliveryTime,
              },
            },
          }
        : {
            delete: true, // Remove delivery details if not a delivery order
          },
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

/**
 * Deletes an order by its ID.
 * @param id - The ID of the order to delete.
 */
export async function deleteOrder(id: string) {
  await db.order.delete({
    where: { id },
  });

  revalidatePath("/admin/orders");
  redirect("/admin/orders");
}

/**
 * Changes the status of an order.
 * @param id - The ID of the order.
 * @param newStatus - The new status to set.
 */
export async function changeOrderStatus(id: string, newStatus: string) {
  const validStatuses = [
    "payment pending",
    "in progress",
    "ready to be picked up",
    "picked up",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (!validStatuses.includes(newStatus.toLowerCase())) {
    throw new Error(`Invalid status: ${newStatus}`);
  }

  const order = await db.order.update({
    where: { id },
    data: { status: newStatus.toLowerCase() },
  });

  if (!order) {
    return notFound();
  }

  // Revalidate relevant paths and redirect
  revalidatePath("/admin/orders");
  redirect("/admin/orders");
}

/**
 * Fetches a single order by its ID, including related order items and delivery details.
 * @param id - The ID of the order to fetch.
 * @returns The order with related data or triggers a notFound response.
 */
export async function fetchOrder(orderId: string): Promise<ExtendedOrder | null> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      orderItems: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
      },
      deliveryDetails: true,
    },
  });
  return order;
}

/**
 * Fetches the transaction status of an order.
 * @param orderId - The ID of the order.
 * @returns An object containing the transaction status and delivery flag.
 */
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

/**
 * Fetches all users with selected fields.
 * @returns An array of users.
 */
export async function fetchUsers(): Promise<User[]> {
  return await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
      emailVerified: true,
      image: true,
      magicLinkToken: true,
      magicLinkExpires: true,
    },
  });
}

/**
 * Fetches all orders, optionally filtered by customer ID.
 * Includes related user, order items, and delivery details.
 * @param customerId - Optional customer ID to filter orders.
 * @returns An array of orders.
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
      deliveryDetails: true, // Include delivery details
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Fetches detailed information about a single user.
 * @param userId - The ID of the user to fetch.
 * @returns The user or null if not found.
 */
export async function fetchUserById(userId: string): Promise<User | null> {
  return await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
      emailVerified: true,
      image: true,
      magicLinkToken: true,
      magicLinkExpires: true,
    },
  });
}

/**
 * Fetches detailed information about a single order.
 * @param orderId - The ID of the order to fetch.
 * @returns The order with related data or null if not found.
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
      deliveryDetails: true, // Include delivery details
    },
  });
}
