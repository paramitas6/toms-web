"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/formatters";
import { useState, useEffect } from "react";
import { addOrder, updateOrder } from "../../_actions/orders";
import { useFormState, useFormStatus } from "react-dom";
import { Textarea } from "@/components/ui/textarea";
import { Order as PrismaOrder, Product, User } from "@prisma/client";

// Extended Order interface to include orderItems
interface Order extends PrismaOrder {
  orderItems: OrderItem[];
}

// Order Item Interface for both products and custom orders
interface OrderItem {
  type: string | null;
  productId?: string | null;
  description?: string | null;
  quantity: number;
  priceInCents: number; // Unit price
  subtotalInCents: number;
}

// Props for OrderForm component
interface OrderFormProps {
  order?: Order | null;
  products: Product[];
  users: User[];
}

export function OrderForm({ order, products, users }: OrderFormProps) {
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
    order?.orderItems.map((item) => {
      if (item.type === "product" && item.productId) {
        const product = products.find((p) => p.id === item.productId);
        return {
          type: "product",
          productId: item.productId,
          description: "",
          quantity: item.quantity,
          priceInCents: product?.priceInCents || 0,
          subtotalInCents: (product?.priceInCents || 0) * item.quantity,
        };
      } else {
        return {
          type: "custom",
          description: item.description || "",
          quantity: item.quantity,
          priceInCents: item.priceInCents,
          subtotalInCents: item.priceInCents * item.quantity,
        };
      }
    }) || []
  );
  const [totalPriceInCents, setTotalPriceInCents] = useState<number>(0);

  const [submissionError, setSubmissionError] = useState<string | null>(null);

  useEffect(() => {
    let total = orderItems.reduce((acc, item) => acc + item.subtotalInCents, 0);
    setTotalPriceInCents(total);
  }, [orderItems]);

  const addOrderItem = (type: "product" | "custom") => {
    if (type === "product") {
      setOrderItems((prev) => [
        ...prev,
        {
          type,
          quantity: 1,
          subtotalInCents: 0,
          priceInCents: 0,
          productId: null,
        },
      ]);
    } else {
      setOrderItems((prev) => [
        ...prev,
        {
          type,
          quantity: 1,
          subtotalInCents: 0,
          priceInCents: 0,
          description: "",
        },
      ]);
    }
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

      if (currentItem.type === "product") {
        if (field === "productId") {
          const selectedProduct = products.find((p) => p.id === value);
          currentItem.priceInCents = selectedProduct?.priceInCents || 0;
          currentItem.subtotalInCents =
            (selectedProduct?.priceInCents || 0) * currentItem.quantity;
        }
        if (field === "quantity") {
          currentItem.subtotalInCents =
            currentItem.priceInCents * currentItem.quantity;
        }
      } else if (currentItem.type === "custom") {
        if (field === "priceInCents" || field === "quantity") {
          currentItem.subtotalInCents =
            currentItem.priceInCents * currentItem.quantity;
        }
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
      formData.set(`orderItems[${index}][type]`, item.type || "");
      if (item.type === "product") {
        formData.set(`orderItems[${index}][productId]`, item.productId || "");
      } else {
        formData.set(
          `orderItems[${index}][description]`,
          item.description || ""
        );
      }
      formData.set(`orderItems[${index}][quantity]`, item.quantity.toString());
      formData.set(
        `orderItems[${index}][priceInCents]`,
        item.priceInCents.toString()
      );
    });

    // Set pricePaidInCents
    formData.set("pricePaidInCents", totalPriceInCents.toString());

    // Convert isDelivery to a boolean string
    formData.set("isDelivery", isDelivery ? "true" : "false");

    if (userId && userId !== "none") {
      formData.set("userId", userId);
    }else(formData.delete("userId"));

    try {
      console.log(formData);
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
      <div className="flex flex-col md:flex-row w-full space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-col w-full md:w-1/4">
          <div className="flex-col p-5">
            <div className="space-y-2">
              <Label htmlFor="userId">Customer</Label>
              <Select
                name="userId"
                value={userId !== "none" ? userId : undefined} // Set to undefined if "none"
                onValueChange={(value) => setUserId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a user..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Walk In</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

            <div className="space-y-2">
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
          </div>

          <div className="flex-col p-5">
            <div className="flex-col">
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
        <div className="flex p-5 border-l md:border-l-0  w-full md:w-3/4">
          <div className="flex flex-col space-y-2 w-full">
            <Label className="text-lg font-semibold">Items</Label>
            {orderItems.map((item, index) => (
              <div key={index} className="space-y-4 border p-4 rounded-md">
                {/* Item Type Selection */}
                <Select
                  name={`orderItems[${index}][type]`}
                  value={item.type || undefined}
                  onValueChange={(value) =>
                    handleOrderItemChange(
                      index,
                      "type",
                      value as "product" | "custom"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select item type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">Existing Product</SelectItem>
                    <SelectItem value="custom">Custom Order</SelectItem>
                  </SelectContent>
                </Select>

                {/* Product Selection or Custom Description */}
                {item.type === "product" ? (
                  <>
                    <Select
                      name={`orderItems[${index}][productId]`}
                      value={item.productId || ""}
                      onValueChange={(value) =>
                        handleOrderItemChange(index, "productId", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product..." />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} -{" "}
                            {formatCurrency(product.priceInCents / 100)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor={`orderItems[${index}][description]`}>
                        Description
                      </Label>
                      <Textarea
                        id={`orderItems[${index}][description]`}
                        name={`orderItems[${index}][description]`}
                        value={item.description || ""}
                        onChange={(e) =>
                          handleOrderItemChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </>
                )}

                {/* Quantity and Unit Price */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {item.type === "product" && (
                    <div className="space-y-2 flex-col">
                      <Label htmlFor={`orderItems[${index}][priceInCents]`}>
                        Price (in cents)
                      </Label>
                      <Input
                        type="number"
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
                      />
                    </div>
                  )}

                  {/* Unit Price */}
                  {item.type === "custom" && (
                    <div className="space-y-2">
                      <Label htmlFor={`orderItems[${index}][priceInCents]`}>
                        Unit Price (in cents)
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
                      />
                    </div>
                  )}
                  {/* Quantity */}

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
                    />
                  </div>

                  {/* Subtotal Display */}
                  <div className="space-y-2 flex-col text-end">
                    <Label>Subtotal</Label>
                    <div className="text-lg font-semibold">
                      {formatCurrency(item.subtotalInCents / 100)}
                    </div>
                  </div>
                  <div className="text-right">
                    {/* Remove Item Button */}
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeOrderItem(index)}
                      className="mt-2"
                    >
                      Remove Item
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <Button
                type="button"
                onClick={() => addOrderItem("custom")}
                variant="outline"
                className="w-full"
              >
                Add Custom
              </Button>
              <Button
                type="button"
                onClick={() => addOrderItem("product")}
                variant="outline"
                className="w-full"
              >
                Add Existing
              </Button>

            </div>
          </div>
        </div>
      </div>

      {isDelivery === true && (
        <div className="flex flex-col md:flex-row p-5 border rounded-lg space-y-4 md:space-y-0 md:space-x-4">
          <div className="space-y-2 flex-1">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              type="text"
              id="postalCode"
              name="postalCode"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </div>

          <div className="space-y-2 flex-1">
            <Label htmlFor="deliveryAddress">Delivery Address</Label>
            <Input
              id="deliveryAddress"
              name="deliveryAddress"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />
          </div>

          <div className="space-y-2 flex-1">
            <Label htmlFor="deliveryInstructions">Delivery Instructions</Label>
            <Textarea
              id="deliveryInstructions"
              name="deliveryInstructions"
              value={deliveryInstructions}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Total Price</Label>
        <div className="text-lg font-semibold">
          {formatCurrency(totalPriceInCents / 100)}
        </div>
      </div>
      {error && (
        <div className="text-red-500">
          {Object.entries(error).map(([field, messages]) =>
            messages ? (
              <div key={field}>
                <strong>{field}:</strong> {messages.join(", ")}
              </div>
            ) : null
          )}
        </div>
      )}

      {submissionError && <div className="text-red-500">{submissionError}</div>}
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
