// src/app/(customerFacing)/user/page.tsx

import React from 'react';
import db from '@/db/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Order, OrderItem } from '@prisma/client'


const UserPage = async () => {
  // Get cookies from the request
  const cookieStore = cookies();
  const token = cookieStore.get('auth')?.value || '';

  const payload = await verifyToken(token);

  if (!payload) {
    // Optionally, you can redirect or show an error
    return <div>Please log in to view your orders.</div>;
  }

  // Fetch user orders
  const orders: (Order & { orderItems: OrderItem[] })[] = await db.order.findMany({
    where: { userId: payload.userId },
    include: {
      orderItems: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="container mx-auto p-4 font-montserrat">
      <h1 className="text-5xl font-bold mb-4 font-gotham tracking-wider">Your Orders</h1>
      {orders.length === 0 ? (
        <p>You have no past orders.</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="border p-4 rounded">
              {/* <h2 className="text-xl font-semibold">Order #{order.id}</h2> */}
              <h2 className="text-xl font-semibold">Order placed on {new Date(order.createdAt).toLocaleDateString()}</h2>
              <p>Status: {order.status}</p>
         

              <h3 className="mt-2 font-semibold">Items:</h3>
              <ul className="list-disc list-inside">
                {order.orderItems.map(item => (
                  <li key={item.id}>
                    {item.description} - Quantity: {item.quantity} - Subtotal: ${(item.subtotalInCents / 100).toFixed(2)}
                  </li>
                ))}
              </ul>
              
              <p>Total Amount Paid: ${(order.pricePaidInCents / 100).toFixed(2)}</p>
              {/* Add more order details as needed */}
            </div>
          ))}
        </div>
      )}
      <Link href="/" className="mt-4 inline-block text-blue-500">Go Back to Home</Link>
    </div>
  );
};

export default UserPage;
