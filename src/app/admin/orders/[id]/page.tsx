// src\app\admin\orders\[id]\page.tsx
"use client"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchOrderById, fetchUserById } from "@/app/admin/_actions/orders";
import { Order as PrismaOrder, User, OrderItem } from "@prisma/client";

interface Order extends PrismaOrder {
  orderItems: OrderItem[];
}

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const fetchedOrder = await fetchOrderById(id) as Order;
        if (!fetchedOrder) {
          console.error("Order not found.");
          return;
        }
        setOrder({ ...fetchedOrder, orderItems: fetchedOrder.orderItems || [] });

        if (fetchedOrder.userId) {
          const fetchedUser = await fetchUserById(fetchedOrder.userId);
          setUser(fetchedUser);
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      }
    };

    fetchOrderDetails();
  }, [id]);

  if (!order) return <div>Loading order details...</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Order Details</h1>
      <p><strong>Order ID:</strong> {order.id}</p>
      <p><strong>Status:</strong> {order.status}</p>
      <p><strong>Recipient:</strong> {order.recipientName}</p>
      <p><strong>Delivery Address:</strong> {order.deliveryAddress}</p>
      <p><strong>Delivery Instructions:</strong> {order.deliveryInstructions}</p>
      <p><strong>Postal Code:</strong> {order.postalCode}</p>
      <p><strong>Notes:</strong> {order.notes}</p>
      <p><strong>Delivery Date:</strong> {order.deliveryDate?.toLocaleString()}</p>
      <p><strong>Delivery Time:</strong> {order.deliveryTime}</p>
      <p><strong>Total Price:</strong> ${(order.pricePaidInCents / 100).toFixed(2)}</p>

      {user && (
        <div>
          <h2 className="text-xl font-semibold mt-4">Customer Information</h2>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mt-4">Order Items</h2>
        <ul className="space-y-2">
          {order.orderItems.map((item) => (
            <li key={item.id} className="p-4 border rounded">
              <p><strong>Product:</strong> {item.productId ? item.description : item.description}</p>
              <p><strong>Quantity:</strong> {item.quantity}</p>
              <p><strong>Price:</strong> ${(item.priceInCents / 100).toFixed(2)}</p>
              <p><strong>Subtotal:</strong> ${(item.subtotalInCents / 100).toFixed(2)}</p>
            </li>
          ))}
        </ul>
      </div>

      <button
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => router.back()}
      >
        Back to Orders
      </button>
    </div>
  );
}
