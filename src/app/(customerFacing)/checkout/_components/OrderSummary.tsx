// src/app/checkout/components/OrderSummary.tsx

"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/formatters";

interface OrderSummaryProps {
  amountWithoutTax: number;
  taxAmount: number;
  deliveryFee: number;
  deliveryOption: string;
  loadingDeliveryFee: boolean;
  deliveryFeeError: string;
  totalAmount: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  amountWithoutTax,
  taxAmount,
  deliveryFee,
  deliveryOption,
  loadingDeliveryFee,
  deliveryFeeError,
  totalAmount,
}) => {
  return (
    <div className="space-y-4">
      <ul className="space-y-2 mt-4">
        <li className="flex justify-between text-gray-700">
          <span>Subtotal</span>
          <span>{formatCurrency(amountWithoutTax)}</span>
        </li>

        {deliveryOption === "delivery" && (
          <li className="flex justify-between text-gray-700">
            <span>Delivery Fee</span>
            {loadingDeliveryFee ? (
              <span>Calculating...</span>
            ) : (
              <span>
                {deliveryFee > 0
                  ? formatCurrency(deliveryFee)
                  : deliveryFeeError
                  ? "N/A"
                  : "$0.00"}
              </span>
            )}
          </li>
        )}
        <li className="flex justify-between text-gray-700">
          <span>13% HST</span>
          <span>${taxAmount.toFixed(2)}</span>
        </li>
        <li className="flex justify-between text-black font-semibold border-t border-gray-300 pt-2">
          <span>Total</span>
          <span className="text-black">{formatCurrency(totalAmount)}</span>
        </li>
      </ul>
    </div>
  );
};

export default OrderSummary;
