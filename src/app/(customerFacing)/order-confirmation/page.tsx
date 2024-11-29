// /app/order-confirmation/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/formatters";
import Link from "next/link";
import Image from "next/image";

interface OrderItem {
  id: string;
  productId: string | null;
  description: string;
  quantity: number;
  subtotalInCents: number;
  cardMessage?: string;
  imagePath: string | null;
  createdAt: string;
  updatedAt: string;
}

interface OrderDetails {
  id: string;
  pricePaidInCents: number;
  isDelivery: boolean;
  recipientName: string | null;
  deliveryFeeInCents: number | null;
  deliveryAddress: string | null;
  deliveryInstructions: string | null;
  postalCode: string | null;
  deliveryDate: string | null;
  deliveryTime: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
}

const OrderConfirmationPage = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      // Fetch order details from backend
      fetch("/api/getOrderDetails?orderId=" + orderId)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }
          return response.json();
        })
        .then((data: OrderDetails) => {
          setOrderDetails(data);
        })
        .catch((error) => {
          console.error("Error fetching order details:", error);
          setError("Failed to load order details. Please try again.");
        });
    }
  }, [orderId]);

  if (!orderId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl font-semibold text-red-500">
          No order ID found.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl font-semibold text-red-500">{error}</p>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl font-semibold text-gray-700">
          Loading order details...
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-5xl font-gotham tracking-wider text-center mb-8">
        Order Confirmation
      </h1>
      <p className="text-center text-xl font-oSans mb-6">
        Thank you for your order!
      </p>
      <div className="bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-xl font-oSans text-gray-800 mb-6">
          A florist will confirm and process your order as soon as possible.
        </h2>
        <div className="space-y-4">
          {/* Order Summary */}
          <div className="border-b pb-4">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              Order Summary
            </h3>

            <p className="text-lg">
              <strong>Order Date:</strong>{" "}
              {new Date(orderDetails.createdAt).toLocaleDateString()}
            </p>
            <p className="text-lg">
              <strong>Status:</strong> {orderDetails.status}
            </p>

            <p className="text-lg">
              <strong>Delivery Option:</strong>{" "}
              {orderDetails.isDelivery ? "Delivery" : "Pickup"}
            </p>
          </div>

          {/* Order Items */}
          <h3 className="text-2xl font-semibold text-gray-700 mt-6">
            Order Items
          </h3>
          <ul className="space-y-4">
            {orderDetails.orderItems.map((item: OrderItem) => (
              <li
                key={item.id}
                className="flex flex-col md:flex-row items-start md:items-center justify-between border-b pb-4"
              >
                <div className="flex items-center space-x-4">
                  {item.imagePath ? (
                    <Image
                      src={item.imagePath}
                      alt={item.description}
                      width={100}
                      height={100}
                      className="rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                  <div>
                    <p className="text-2xl font-semibold text-gray-800">
                      {item.description}
                    </p>
                    <p className="text-lg text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                    {item.cardMessage && (
                      <p className="text-md text-pink-600">
                        Card Message: "{item.cardMessage}"
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <p className="text-xl font-bold text-gray-800">
                    {formatCurrency(item.subtotalInCents / 100)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {orderDetails.isDelivery && (
            <>
              <div className="text-lg">
                <strong>Recipient Name:</strong> {orderDetails.recipientName}
              </div>
              <div className="flex gap-4 text-lg">
                <strong>Delivery Address:</strong>{" "}
                {orderDetails.deliveryAddress}
                {orderDetails.postalCode && (
                  <>
                    <strong>Postal Code:</strong> {orderDetails.postalCode}
                  </>
                )}
              </div>

              <div className="flex text-lg gap-4">
                <strong>Delivery Date:</strong>{" "}
                {orderDetails.deliveryDate?.split("T")[0]}
                <strong>Delivery Time:</strong> {orderDetails.deliveryTime}
              </div>

              {orderDetails.deliveryInstructions && (
                <div className="text-lg flex justify-between">
                  <div>
                    {" "}
                    <strong>Delivery Instructions:</strong>{" "}
                    {orderDetails.deliveryInstructions}
                  </div>
                  {orderDetails.deliveryFeeInCents && (
                    <div>
                      <strong>Delivery Fee:</strong>{" "}
                      {formatCurrency(orderDetails.deliveryFeeInCents / 100)}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Order Total */}
          <div className="mt-6 flex flex-col justify-end">
            <div className="text-right">
              <p className="text-lg">
                <strong>Subtotal:</strong>{" "}
                {formatCurrency(orderDetails.pricePaidInCents/1.13 / 100)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg">
                <strong>13% HST:</strong>{" "}
                {formatCurrency(((orderDetails.pricePaidInCents/1.13)*0.13 / 100) )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg">
                <strong>Total Amount:</strong>{" "}
                {formatCurrency(orderDetails.pricePaidInCents / 100)}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-8">
        <Link href="/shop">
          <button className=" hover:bg-red-100 text-red-300 text-xl py-3 px-8 rounded-lg transition duration-300">
            Back to Shop
          </button>
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
