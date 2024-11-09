"use server";

import { addOrder } from "./orders";

export async function addQuickOrder(formData: FormData) {
  const description = formData.get("description") as string;
  const amount = parseInt(formData.get("amount") as string, 10);
  const applyTax = formData.get("applyTax") === "on";

  let finalAmount = amount;
  if (applyTax) {
    finalAmount = Math.round(amount * 1.13);
  }

  const newFormData = new FormData();
  newFormData.append("isDelivery", "false");
  newFormData.append("status", "Payment Pending");
  newFormData.append("orderItems[0][description]", description);
  newFormData.append("orderItems[0][priceInCents]", finalAmount.toString());
  newFormData.append("orderItems[0][quantity]", "1");
  newFormData.append("orderItems[0][type]", "custom");

  await addOrder(null, newFormData);
}
