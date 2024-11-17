"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchOrderById, fetchUserById } from "@/app/admin/_actions/orders";
import {
  Order as PrismaOrder,
  User,
  OrderItem,
  DeliveryDetails,
} from "@prisma/client";
import { formatCurrency, formatDate } from "@/lib/formatters";

interface Order extends PrismaOrder {
  orderItems: OrderItem[];
  deliveryDetails?: DeliveryDetails | null;
}

export default function OrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const fetchedOrder = (await fetchOrderById(id)) as Order;
        if (!fetchedOrder) {
          console.error("Order not found.");
          return;
        }
        setOrder({
          ...fetchedOrder,
          orderItems: fetchedOrder.orderItems || [],
        });

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

  if (!order)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading order details...
      </div>
    );

  return (
    <div className="p-8 bg-white bg-opacity-90 shadow-lg rounded-lg max-w-4xl mx-auto mt-10 border border-gray-200">
      <h1 className="text-5xl  font-gotham tracking-wider text-center mb-6 text-gray-700">
        Order Details
      </h1>

      {/* Invoice Number Instead of Order ID */}
      <div className="grid  grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <p>
            <strong className="text-gray-600">Invoice Number:</strong>{" "}
            {order.invoiceNumber || ""}
          </p>
          <p>
            <strong className="text-gray-600">Status:</strong> {order.status}
          </p>
          <p>
            <strong className="text-gray-600">Guest Name:</strong>{" "}
            {order.guestName || "Walk In"}
          </p>
          <p>
            <strong className="text-gray-600">Guest Phone:</strong>{" "}
            {order.guestName || ""}
          </p>
          <p>
            <strong className="text-gray-600">Guest Email:</strong>{" "}
            {order.guestEmail || ""}
          </p>

          <p>
            <strong className="text-gray-600">Due Date:</strong>{" "}
            {order.deliveryDate ? formatDate(order.deliveryDate) : ""}
          </p>
          <p>
            <strong className="text-gray-600">Due Time:</strong>{" "}
            {order.deliveryTime || ""}
          </p>
        </div>
        <div className="flex flex-col">
          <p>
            <strong className="text-gray-600">Notes:</strong>{" "}
            {order.notes || ""}
          </p>
          <p>
            <strong className="text-gray-600">Payment Method:</strong>{" "}
            {order.paymentMethod || ""}
          </p>

          <p>
            <strong className="text-gray-600">Transaction Status:</strong>{" "}
            {order.transactionStatus || ""}
          </p>

          <p>
            <strong className="text-gray-600">Subtotal:</strong>{" "}
            {order.pricePaidInCents
              ? formatCurrency(
                  (order.pricePaidInCents -
                    (order.taxInCents || 0) -
                    (order.deliveryFeeInCents || 0)) /
                    100
                )
              : "0.00"}
          </p>
          <p>
            <strong className="text-gray-600">Delivery Fee:</strong>{" "}
            {order.deliveryFeeInCents
              ? formatCurrency(order.deliveryFeeInCents / 100)
              : "0.00"}
          </p>
          <p>
            <strong className="text-gray-600">Tax:</strong>{" "}
            {order.taxInCents ? formatCurrency(order.taxInCents / 100) : "0.00"}
          </p>

          <p>
            <strong className="text-gray-600">Total Paid:</strong>{" "}
            {formatCurrency(order.pricePaidInCents / 100)}
          </p>
        </div>
      </div>

      {/* Delivery Details */}
      {order.deliveryDetails && (
        <>
          <h2 className="text-2xl font-montserrat font-semibold text-gray-700 my-4">
            Delivery Details
          </h2>
          <div className="mt-8 bg-pink-50 p-6 rounded-lg  border-gray-200 ">
            <div className="grid  grid-cols-1  md:grid-cols-2 gap-4 ">
              <div>
                {" "}
                <p>
                  <strong className="text-gray-600">Recipient Name:</strong>{" "}
                  {order.deliveryDetails.recipientName || ""}
                </p>
                <p>
                  <strong className="text-gray-600">Recipient Phone:</strong>{" "}
                  {order.deliveryDetails.recipientPhone || ""}
                </p>
                <p>
                  <strong className="text-gray-600">Delivery Address:</strong>{" "}
                  {order.deliveryDetails.deliveryAddress || ""}
                </p>
                <p>
                  <strong className="text-gray-600">Postal Code:</strong>{" "}
                  {order.deliveryDetails.postalCode || ""}
                </p>
              </div>
              <div>
                {" "}
                <p>
                  <strong className="text-gray-600">
                    Delivery Instructions:
                  </strong>{" "}
                  {order.deliveryDetails.deliveryInstructions || ""}
                </p>
                <p>
                  <strong className="text-gray-600">Delivery Status:</strong>{" "}
                  {order.deliveryDetails.deliveryStatus || ""}
                </p>
                <p>
                  <strong className="text-gray-600">Delivery Date:</strong>{" "}
                  {order.deliveryDetails.deliveryDate
                    ? formatDate(order.deliveryDetails.deliveryDate)
                    : ""}
                </p>
                <p>
                  <strong className="text-gray-600">Delivery Time:</strong>{" "}
                  {order.deliveryDetails.deliveryTime || ""}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Customer Information */}
      {user && (
        <div className="mt-8 bg-green-50 p-6 rounded-lg border border-green-200">
          <h2 className="text-2xl font-serif font-semibold text-green-700 mb-4">
            Customer Information
          </h2>
          <div className="flex items-center space-x-4">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || "User Image"}
                className="w-16 h-16 rounded-full border border-green-300"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-700"></div>
            )}
            <div>
              <p>
                <strong className="text-green-600">Name:</strong>{" "}
                {user.name || ""}
              </p>
              <p>
                <strong className="text-green-600">Email:</strong>{" "}
                {user.email || ""}
              </p>
              <p>
                <strong className="text-green-600">Phone:</strong>{" "}
                {user.phone || ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="mt-8">
        <h2 className="text-2xl font-montserrat font-semibold text-purple-700 mb-4">
          Order Items
        </h2>
        <ul className="flex">
          {order.orderItems.map((item) => (
            <li key={item.id} className="p-6 bg-purple-50 rounded-lg flex space-x-2 w-full">
              <p className="flex w-2/3">
                <strong className="text-purple-600"></strong>{" "}
                {item.description +" "+ " @ "+item.quantity+"  x  "+  formatCurrency(item.priceInCents / 100)|| ""}
              </p>

              <p>
                <strong className="text-purple-600">Subtotal:</strong>{" "}
                {formatCurrency(item.subtotalInCents / 100)}
              </p>
              {item.cardMessage && (
                <p className="flex w-1/3">
                  <strong className="text-purple-600">Card Message:</strong>{" "}
                  {item.cardMessage}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Back Button */}
      <button
        className="mt-10 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center mx-auto"
        onClick={() => router.back()}
      >
        ← Back to Orders
      </button>

      {/* Floral Accent SVG */}
      <div className="absolute bottom-0 right-0 opacity-20">
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="100" r="100" fill="#FFEBF0" />
          <path
            d="M50 100C50 150 150 150 150 100C150 50 50 50 50 100Z"
            fill="#FFD1DC"
          />
          <path
            d="M100 50C120 70 120 130 100 150C80 130 80 70 100 50Z"
            fill="#FFB6C1"
          />
        </svg>
      </div>
    </div>
  );
}
