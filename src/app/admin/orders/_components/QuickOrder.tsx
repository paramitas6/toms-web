// src/app/admin/orders/_components/QuickOrder.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/formatters";
import { useState, useEffect } from "react";
import { addOrder, updateOrder } from "../../_actions/orders";
import { useFormState, useFormStatus } from "react-dom";
import { Textarea } from "@/components/ui/textarea";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { Order as PrismaOrder, User } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UserAutocomplete from "@/app/admin/_components/UserAutocomplete";

interface Order extends PrismaOrder {
  orderItems: OrderItem[];
  includeTax: boolean;
}

interface OrderItem {
  type: "custom";
  description: string;
  quantity: number;
  priceInCents: number;
  subtotalInCents: number;
}

interface OrderFormProps {
  order?: Order | null;
  users: User[];
}

export default function QuickOrder({ order, users }: OrderFormProps) {
  const [error, action] = useFormState(
    order == null ? addOrder : updateOrder.bind(null, order.id),
    {}
  );

  const [userId, setUserId] = useState<string>(order?.userId || "none");
  const [isDelivery, setIsDelivery] = useState<boolean>(
    order?.isDelivery || false
  );
  const [status, setStatus] = useState<string>(
    order?.status || "payment pending"
  );
  const [notes, setNotes] = useState<string>(order?.notes || "");
  const [postalCode, setPostalCode] = useState<string>(order?.postalCode || "");
  const [recipientPhone, setRecipientPhone] = useState<string>(
    order?.recipientPhone || ""
  );
  const [recipientName, setRecipientName] = useState<string>(
    order?.recipientName || ""
  );
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    order?.deliveryAddress || ""
  );
  const [deliveryInstructions, setDeliveryInstructions] = useState<string>(
    order?.deliveryInstructions || ""
  );
  const [deliveryDate, setDeliveryDate] = useState<string>(
    order?.deliveryDate ? order.deliveryDate.toISOString().split("T")[0] : ""
  );
  const [deliveryTime, setDeliveryTime] = useState<string>(
    order?.deliveryTime || ""
  );

  const [orderItems, setOrderItems] = useState<OrderItem[]>(
    order?.orderItems.map((item) => ({
      type: "custom",
      description: item.description || "",
      quantity: item.quantity,
      priceInCents: item.priceInCents,
      subtotalInCents: item.priceInCents * item.quantity,
    })) || [
      {
        type: "custom",
        description: "",
        quantity: 1,
        priceInCents: 0,
        subtotalInCents: 0,
      },
    ]
  );
  const [subtotalInCents, setSubtotalInCents] = useState<number>(0);
  const [taxInCents, setTaxInCents] = useState<number>(0);
  const [totalPriceInCents, setTotalPriceInCents] = useState<number>(0);
  const [includeTax, setIncludeTax] = useState<boolean>(
    order?.includeTax || true
  );

  const [submissionError, setSubmissionError] = useState<string | null>(null);

  useEffect(() => {
    const subtotal = orderItems.reduce(
      (acc, item) => acc + item.subtotalInCents,
      0
    );
    setSubtotalInCents(subtotal);
    const tax = includeTax ? Math.round(subtotal * 0.13) : 0;
    setTaxInCents(tax);
    setTotalPriceInCents(subtotal + tax);
  }, [orderItems, includeTax]);

  const addOrderItem = () => {
    setOrderItems((prev) => [
      ...prev,
      {
        type: "custom",
        description: "",
        quantity: 1,
        priceInCents: 0,
        subtotalInCents: 0,
      },
    ]);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOrderItemChange = (
    index: number,
    field: keyof OrderItem,
    value: any
  ) => {
    setOrderItems((prev) => {
      const newItems = [...prev];
      const currentItem = { ...newItems[index], [field]: value };

      if (field === "priceInCents" || field === "quantity") {
        currentItem.subtotalInCents =
          currentItem.priceInCents * currentItem.quantity;
      }

      newItems[index] = currentItem;
      return newItems;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Create a new FormData object without serializing orderItems
    const formData = new FormData(e.currentTarget);

    // Append individual orderItems fields
    orderItems.forEach((item, index) => {
      formData.set(`orderItems[${index}][type]`, item.type);
      formData.set(`orderItems[${index}][description]`, item.description);
      formData.set(`orderItems[${index}][quantity]`, item.quantity.toString());
      formData.set(
        `orderItems[${index}][priceInCents]`,
        item.priceInCents.toString()
      );
    });

    // Set subtotal, tax, and total
    formData.set("subtotalInCents", subtotalInCents.toString());
    formData.set("taxInCents", taxInCents.toString());
    formData.set("totalPriceInCents", totalPriceInCents.toString());

    // Set includeTax
    formData.set("includeTax", includeTax.toString());

    // Set pricePaidInCents
    formData.set("pricePaidInCents", totalPriceInCents.toString());
    console.log(totalPriceInCents);

    // Convert isDelivery to a boolean string
    formData.set("isDelivery", isDelivery ? "true" : "false");

    if (userId && userId !== "none") {
      formData.set("userId", userId);
    } else {
      formData.delete("userId");
    }

    // Set recipientName
    if (isDelivery) {
      formData.set("recipientName", recipientName);
    } else {
      formData.delete("recipientName");
    }

    try {
      console.log(Object.fromEntries(formData.entries()));
      await action(formData);
    } catch (err) {
      setSubmissionError("Failed to save order. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-6 rounded-lg shadow-md"
    >
      {/* Customer and Order Status Section */}
      <div className="flex flex-col md:flex-row w-full space-y-4 md:space-y-0 md:space-x-4">
        {/* Order Items Section */}
        <div className="flex p-5  w-full md:w-2/4">
          <div className="flex flex-col space-y-4 w-full">
            <div className="flex justify-between">
              <Label className="text-lg font-semibold">Sale Items</Label>
              <Button
                type="button"
                onClick={addOrderItem}
                variant="outline"
                className="w-auto"
              >
                +
              </Button>
            </div>

            {orderItems.map((item, index) => (
              <div
                key={index}
                className="space-y-4 border p-4 rounded-md bg-gray-50"
              >
                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor={`orderItems[${index}][description]`}>
                    Description
                  </Label>
                  <AutosizeTextarea
                    minHeight={25}
                    id={`orderItems[${index}][description]`}
                    name={`orderItems[${index}][description]`}
                    value={item.description}
                    onChange={(e) =>
                      handleOrderItemChange(
                        index,
                        "description",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>

                {/* Quantity and Unit Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`orderItems[${index}][priceInCents]`}>
                      Price (in cents)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      id={`orderItems[${index}][priceInCents]`}
                      name={`orderItems[${index}][priceInCents]`}
                      value={item.priceInCents}
                      onChange={(e) =>
                        handleOrderItemChange(
                          index,
                          "priceInCents",
                          Number(e.target.value)
                        )
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`orderItems[${index}][quantity]`}>
                      Quantity
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      id={`orderItems[${index}][quantity]`}
                      name={`orderItems[${index}][quantity]`}
                      value={item.quantity}
                      onChange={(e) =>
                        handleOrderItemChange(
                          index,
                          "quantity",
                          Number(e.target.value)
                        )
                      }
                      required
                    />
                  </div>
                </div>

                {/* Subtotal Display and Remove Button */}
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">
                    Subtotal: {formatCurrency(item.subtotalInCents / 100)}
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeOrderItem(index)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex justify-end"></div>
          </div>
        </div>
        {/* Customer Selection */}
        <div className="flex-col w-full md:w-1/4">
          <div className="flex-col p-5 space-y-2">
            <div className="space-y-2">
              <Label htmlFor="userId">Customer</Label>
              <UserAutocomplete
                users={users}
                selectedId={userId !== "none" ? userId : null}
                onSelect={(user) => setUserId(user?.id || "none")}
              />
            </div>

            {/* Order Status Selection */}
            <div className="space-y-2 mt-4">
              <Label htmlFor="status">Order Status</Label>
              <Select
                name="status"
                required
                value={status}
                onValueChange={setStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select order status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment pending">
                    Payment Pending
                  </SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="ready to be picked up">
                    Ready to be Picked Up
                  </SelectItem>
                  <SelectItem value="picked up">Picked Up</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-col space-y-2">
              <div className="space-y-2">
                <Label htmlFor="deliveryDate">Due Date</Label>
                <Input
                  type="date"
                  id="deliveryDate"
                  name="deliveryDate"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryTime">Time</Label>
                <Input
                  type="time"
                  id="deliveryTime"
                  name="deliveryTime"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex-col w-full md:w-1/4 p-5 space-y-2">
          <div className="space-y-2">
            <Label htmlFor="isDelivery">Delivery Option</Label>
            <Select
              name="isDelivery"
              required
              value={isDelivery ? "true" : "false"}
              onValueChange={(value) => setIsDelivery(value === "true")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select delivery option..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Delivery</SelectItem>
                <SelectItem value="false">Pick Up</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Delivery Details Section */}
          {isDelivery && (
            <>
              <div className="space-y-2 flex-1">
                <Label htmlFor="recipientName">Recipient Name</Label>
                <Input
                  type="text"
                  id="recipientName"
                  name="recipientName"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  required={isDelivery}
                />
              </div>

              <div className="space-y-2 flex-1">
                <Label htmlFor="recipientPhone">Recipient Phone</Label>
                <Input
                  type="tel"
                  id="recipientPhone"
                  name="recipientPhone"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  required={isDelivery}
                />
              </div>

              <div className="space-y-2 flex-1">
                <Label htmlFor="deliveryAddress">Street Address</Label>
                <Input
                  id="deliveryAddress"
                  name="deliveryAddress"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required={isDelivery}
                />
              </div>

              <div className="space-y-2 flex-1">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required={isDelivery}
                />
              </div>

              <div className="space-y-2 flex-1">
                <Label htmlFor="deliveryInstructions">
                  Buzzer Code / Instructions
                </Label>

                <Textarea
                  id="deliveryInstructions"
                  name="deliveryInstructions"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  className="flex h-[25px]"
                />
              </div>
            </>
          )}

          {/* Notes Section */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <AutosizeTextarea
              minHeight={25}
              id="notes"
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* HST Checkbox */}
          <div className="flex justify-end space-x-2">
            <input
              type="checkbox"
              id="includeTax"
              name="includeTax"
              checked={includeTax}
              onChange={(e) => setIncludeTax(e.target.checked)}
            />
            <Label htmlFor="includeTax">13% HST Applicable</Label>
          </div>
        </div>
      </div>

      {/* Price Summary */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(subtotalInCents / 100)}</span>
        </div>
        {includeTax && (
          <div className="flex justify-between">
            <span>Tax (13% HST):</span>
            <span>{formatCurrency(taxInCents / 100)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>{formatCurrency(totalPriceInCents / 100)}</span>
        </div>
      </div>

      {error && (
        <div className="text-red-500">
          {Object.entries(error).map(([field, messages]) =>
            messages && Array.isArray(messages) ? (
              <div key={field}>
                <strong>{field}:</strong> {messages.join(", ")}
              </div>
            ) : null
          )}
        </div>
      )}

      {submissionError && <div className="text-red-500">{submissionError}</div>}

      {/* Submit Button */}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </Button>
  );
}
