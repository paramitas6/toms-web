// src/app/admin/orders/components/types.ts

export type Order = {
  id: string;
  user: {
    name: string;
    email: string;
  } | null;
  orderItems: {
    id: string;
    quantity: number;
    product?: {
      name?: string;
      description?: string | null;
      images?: {
        imagePath: string;
      }[];
    } | null;
    description?: string | null;
    productId?: string|null;
    subtotalInCents: number;
    imagePath?: string;
    createdAt: Date; // or string
    updatedAt: Date; // or string
  }[];
  pricePaidInCents: number;
  status: String| 'payment pending' | 'in progress' | 'ready to be picked up' | 'picked up';
  createdAt: Date; // or string
  isDelivery: boolean|null;
  deliveryDate: Date | null; // or string | null
  deliveryTime: string | null;
  recipientName: string | null;
  deliveryAddress: string |null;
  deliveryInstructions: string |null;
  postalCode: string |null;
  updatedAt: Date; // or string
  // Include other properties as needed
};
