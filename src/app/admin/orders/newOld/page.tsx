// app/orders/[id]/page.tsx

import { OrderForm } from '@/app/admin/orders/_components/OrderForm';
import { fetchUsers } from '@/app/admin/_actions/users';
import { fetchProducts } from '@/app/admin/_actions/products';
import { fetchOrder } from '@/app/admin/_actions/orders'; // Ensure correct path
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Order',
};

interface OrderPageProps {
  params: { id: string };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const [users, products] = await Promise.all([
    fetchUsers(),
    fetchProducts(),
  ]);
  let order = null;

  if (params.id) {
    order = await fetchOrder(params.id);
  }

  return (
    <div className="container mx-auto p-10">
      <h1 className="text-2xl font-bold mb-4">{order ? 'Edit Order' : 'Create New Order'}</h1>
      <OrderForm order={order} users={users} products={products} />
    </div>
  );
}
