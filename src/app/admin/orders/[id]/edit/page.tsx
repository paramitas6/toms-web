// orders/[id]/edit/page.tsx

import db from "@/db/db";
import { PageHeader } from "../../../_components/PageHeader";
import { OrderForm } from "../../_components/OrderForm";
import { Order, OrderItem, Product, User } from "@prisma/client";

interface OrderWithItems extends Order {
  orderItems: (OrderItem & { product: Product | null })[];
}

export default async function EditOrderPage({
  params: { id },
}: {
  params: { id: string };
}) {
  // Fetch the order with related data from the database
  const order = await db.order.findUnique({
    where: { id },
    include: {
      orderItems: { include: { product: true, } },
      user: true,
    },
  });

  if (!order) {
    return <p>Order not found</p>;
  }

  // Fetch users and products from the database
  const users = await db.user.findMany();
  const products = await db.product.findMany();

  return (
    <>
      <PageHeader>Edit Order</PageHeader>
      <OrderForm
        order={order as OrderWithItems} // Type assertion
        users={users}
        products={products}
      />
    </>
  );
}
