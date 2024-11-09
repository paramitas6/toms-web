// app/orders/[id]/page.tsx

import QuickOrder from '@/app/admin/orders/_components/QuickOrder';
import { fetchUsers } from '@/app/admin/_actions/users';
import { fetchProducts } from '@/app/admin/_actions/products';
import { fetchOrder } from '@/app/admin/_actions/orders'; // Ensure correct path
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quick Order',
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
    const fetchedOrder = await fetchOrder(params.id);
    order = fetchedOrder ? { 
      ...fetchedOrder, 
      includeTax: (fetchedOrder as any).includeTax ?? false,
      orderItems: fetchedOrder.orderItems.map((item: any) => ({
        ...item,
        type: item.type ?? 'custom'
      }))
    } : null;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-5xl font-montserrat mb-4">{order ? 'Edit Order' : 'New Order'}</h1>
      <QuickOrder order={order} users={users} />
    </div>
  );
}
