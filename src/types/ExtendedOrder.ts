// src/types/ExtendedOrder.ts

import {
    Order as PrismaOrder,
    OrderItem,
    DeliveryDetails,
    Product,
    Image,
    User,
  } from "@prisma/client";
  
  export interface ExtendedOrder extends PrismaOrder {
    user: User | null;
    orderItems: (OrderItem & {
      product: Product & {
        images: Image[];
      } | null;
    })[];
    deliveryDetails: DeliveryDetails | null;
  }
  