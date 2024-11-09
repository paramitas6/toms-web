// src/types/types.ts

import { Product, Image } from "@prisma/client";

export type ProductType = Product;
export type ImageType = Image;

export interface AdminEvent extends Event {
    orderId: string;
    userName: string;
  }