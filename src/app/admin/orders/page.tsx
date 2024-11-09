// src/app/admin/orders/page.tsx

import { Button } from "@/components/ui/button";
import { PageHeader } from "../_components/PageHeader";
import Link from "next/link";
import OrdersTable from "./_components/OrdersTable";
import db from "@/db/db";
import { Order } from "./types"; // Import the consolidated Order type

export default async function AdminOrdersPage() {
  const orders: Order[] = await db.order.findMany({
    include: {
      user: true,
      orderItems: {
        include: {
          product: {
            include: {
              images: true, // Include images if needed
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // If needed, map over orders to ensure types match
  // For example, adjust status to be one of the allowed values

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <PageHeader>Orders</PageHeader>
        <Button asChild>
          <Link href="/admin/orders/new">Create Order</Link>
        </Button>
      </div>
      <div className="mt-8">
        <OrdersTable orders={orders} />
      </div>
    </>
  );
}
