// src\app\admin\quickorder\page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { addQuickOrder } from "../_actions/addQuickOrder";

// Currency formatter for cents to dollars (e.g., 1000 cents -> $10.00)
const currencyFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2,
});

export default function QuickOrderPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Quick Order</h1>
      <QuickOrderForm />
    </div>
  );
}

function QuickOrderForm() {
  const [applyTax, setApplyTax] = useState(true);
  const [amount, setAmount] = useState(0);
  const [preTaxAmount, setPreTaxAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const taxRate = 0.13;
    const preTax = amount / 100; // Convert cents to dollars
    const tax = applyTax ? preTax * taxRate : 0;
    const finalTotal = preTax + tax;

    setPreTaxAmount(preTax);
    setTaxAmount(tax);
    setTotal(finalTotal);
  }, [amount, applyTax]);

  return (
    <form action={addQuickOrder} className="max-w-md space-y-4">
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="description"
          id="description"
          required
          placeholder="Enter order description"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700"
        >
          Amount (in cents)<span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="amount"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
          required
          min="1"
          placeholder="Enter amount in cents"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="applyTax"
          id="applyTax"
          checked={applyTax}
          onChange={() => setApplyTax(!applyTax)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="applyTax" className="ml-2 block text-sm text-gray-700">
          13% HST
        </label>
      </div>

      <div className="text-end">
        <p className="text-lg font-medium">
          Subtotal: {currencyFormatter.format(preTaxAmount)}
        </p>
        <p className="text-lg font-medium">
          Tax: {currencyFormatter.format(taxAmount)}
        </p>
        <hr></hr>
        <p className="text-lg font-bold">
          Total: {currencyFormatter.format(total)}
        </p>
      </div>

      <div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Submit Quick Order
        </button>
      </div>
    </form>
  );
}
