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
import {
  Order as PrismaOrder,
  User,
  OrderItem,
  DeliveryDetails,
} from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UserAutocomplete from "@/app/admin/_components/UserAutocomplete";
import { calculateDeliveryFee } from "@/lib/deliveryFee";
import { v4 as uuidv4 } from "uuid";

// New imports for Popover and Calendar
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"; // Adjust the path as needed
import { Calendar } from "@/components/ui/calendar"; // Adjust the path as needed
import { CalendarIcon, PlusIcon } from "lucide-react"; // Ensure you have the CalendarIcon or use an appropriate icon
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"; // Adjust the path as needed
import Link from "next/link";
import { FaAd, FaPlus } from "react-icons/fa";

interface Order extends PrismaOrder {
  orderItems: OrderItem[];
  includeTax: boolean;
  deliveryDetails?: DeliveryDetails | null;
}

interface OrderFormProps {
  order?: Order | null;
  users: User[];
}

const ORIGIN_POSTAL_CODE = "M5A"; // Replace with your store's origin postal code prefix

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
  const [postalCode, setPostalCode] = useState<string>(
    order?.deliveryDetails?.postalCode || ""
  );
  const [recipientPhone, setRecipientPhone] = useState<string>(
    order?.deliveryDetails?.recipientPhone || ""
  );
  const [recipientName, setRecipientName] = useState<string>(
    order?.deliveryDetails?.recipientName || ""
  );
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    order?.deliveryDetails?.deliveryAddress || ""
  );
  const [deliveryInstructions, setDeliveryInstructions] = useState<string>(
    order?.deliveryDetails?.deliveryInstructions || ""
  );

  // New state for managing the popover and selected date
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [deliveryDate, setDeliveryDate] = useState<string>(
    order?.deliveryDate ? order.deliveryDate.toISOString().split("T")[0] : ""
  );

  const [deliveryTime, setDeliveryTime] = useState<string>(
    order?.deliveryTime || ""
  );

  const [orderItems, setOrderItems] = useState<OrderItem[]>(
    order?.orderItems.map((item) => ({
      id: item.id,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      type: item.productId ? "product" : "custom",
      productId: item.productId,
      description: item.description || "",
      quantity: item.quantity,
      priceInCents: item.priceInCents,
      cardMessage: item.cardMessage,
      subtotalInCents: item.priceInCents * item.quantity,
      orderId: item.orderId,
    })) || [
      {
        id: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        type: "custom",
        productId: null,
        description: "",
        quantity: 1,
        priceInCents: 0,
        cardMessage: null,
        subtotalInCents: 0,
        orderId: "",
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

  // New states for delivery fee
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [isCalculatingFee, setIsCalculatingFee] = useState<boolean>(false);
  const [feeError, setFeeError] = useState<string | null>(null);

  // New state for User Creation Modal
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);

  // Manage users list locally if desired
  const [localUsers, setLocalUsers] = useState<User[]>(users);

  const handleNewUser = (newUser: User) => {
    setLocalUsers((prevUsers) => [...prevUsers, newUser]);
    setUserId(newUser.id);
  };

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
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        type: "custom",
        productId: null,
        description: "",
        quantity: 1,
        priceInCents: 0,
        cardMessage: null,
        subtotalInCents: 0,
        orderId: order?.id || "",
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

  // New handler for date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = date.toISOString().split("T")[0];
      setDeliveryDate(formattedDate);
      setIsDatePickerOpen(false);
    }
  };

  // Handler to calculate delivery fee
  const handleCalculateDeliveryFee = () => {
    setFeeError(null);

    // Validate postal codes
    const originPostal = ORIGIN_POSTAL_CODE;
    const destinationPostal = postalCode.slice(0, 3).toUpperCase(); // Ensure 3-character prefix

    if (originPostal.length !== 3 || destinationPostal.length !== 3) {
      setFeeError("Please enter valid 3-character postal codes.");
      return;
    }

    try {
      setIsCalculatingFee(true);
      const fee = calculateDeliveryFee(originPostal, destinationPostal);
      setDeliveryFee(fee);
    } catch (error: any) {
      setFeeError(error.message || "Failed to calculate delivery fee.");
    } finally {
      setIsCalculatingFee(false);
    }
  };

  // Handler to add delivery fee to order items
  const handleAddDeliveryFee = () => {
    if (deliveryFee === null) {
      setFeeError("Please calculate the delivery fee first.");
      return;
    }

    const isFeeAlreadyAdded = orderItems.some(
      (item) => item.type === "delivery"
    );

    if (isFeeAlreadyAdded) {
      setFeeError("Delivery fee has already been added to the order.");
      return;
    }

    const deliveryItem: OrderItem = {
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      type: "delivery",
      productId: null,
      description: "Delivery Fee",
      quantity: 1,
      priceInCents: deliveryFee * 100, // Assuming deliveryFee is in currency units
      cardMessage: null,
      subtotalInCents: deliveryFee * 100,
      orderId: order?.id || "",
    };

    setOrderItems((prev) => [...prev, deliveryItem]);
    setDeliveryFee(null); // Reset after adding
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    orderItems.forEach((item, index) => {
      formData.set(`orderItems[${index}][type]`, item.type || "");
      formData.set(`orderItems[${index}][description]`, item.description || "");
      formData.set(`orderItems[${index}][quantity]`, item.quantity.toString());
      formData.set(
        `orderItems[${index}][priceInCents]`,
        item.priceInCents.toString()
      );
    });

    formData.set("subtotalInCents", subtotalInCents.toString());
    formData.set("taxInCents", taxInCents.toString());
    formData.set("totalPriceInCents", totalPriceInCents.toString());

    formData.set("includeTax", includeTax.toString());

    formData.set("pricePaidInCents", totalPriceInCents.toString());

    formData.set("isDelivery", isDelivery ? "true" : "false");

    if (userId && userId !== "none") {
      formData.set("userId", userId);
    } else {
      formData.delete("userId");
    }

    if (isDelivery) {
      formData.set("recipientName", recipientName);
      formData.set("recipientPhone", recipientPhone);
      formData.set("deliveryAddress", deliveryAddress);
      formData.set("postalCode", postalCode);
      formData.set("deliveryInstructions", deliveryInstructions);

      // Default deliveryDate to today if empty
      let finalDeliveryDate = deliveryDate;
      if (!finalDeliveryDate) {
        finalDeliveryDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      }

      // Default deliveryTime to now rounded to the nearest minute if empty
      let finalDeliveryTime = deliveryTime;
      if (!finalDeliveryTime) {
        const now = new Date();
        now.setSeconds(0, 0); // Zero out seconds and milliseconds
        finalDeliveryTime = now.toTimeString().slice(0, 5); // HH:MM
      }

      formData.set("deliveryDate", finalDeliveryDate);
      formData.set("deliveryTime", finalDeliveryTime);
    } else {
      formData.delete("recipientName");
      formData.delete("recipientPhone");
      formData.delete("deliveryAddress");
      formData.delete("postalCode");
      formData.delete("deliveryInstructions");
      formData.delete("deliveryDate");
      formData.delete("deliveryTime");
    }

    try {
      await action(formData);
    } catch (err) {
      setSubmissionError("Failed to save order. Please try again.");
    }
  };

  // Handler for adding a new user from the modal
  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    // Add other fields as necessary

    try {
      const response = await fetch("/api/admin/users", {
        // Adjust the API endpoint as needed
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }), // Include other fields
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add user");
      }

      const newUser: User = await response.json();

      // Update the local users list
      handleNewUser(newUser);

      // Close the modal
      setIsUserModalOpen(false);

      // Optionally, reset the form
      form.reset();
    } catch (error: any) {
      // Handle error (you might want to display this in the UI)
      console.error(error);
      alert(error.message || "Failed to add user");
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-lg shadow-md"
      >
        {/* Customer and Order Status Section */}
        <div className="flex flex-col md:flex-row w-full space-y-4 md:space-y-2 md:space-x-2 md:m-0">
          {/* Order Items Section */}
          <div className="flex p-2  w-full md:w-2/4">
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
                  key={item.id || index}
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
                      value={item.description || ""}
                      onChange={(e) =>
                        handleOrderItemChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder={`E.g. $75 Bouquet White/Yellow`}
                      required
                    />
                  </div>

                  {/* Type, Quantity and Unit Price */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`orderItems[${index}][type]`}>Type</Label>
                      <Select
                        name={`orderItems[${index}][type]`}
                        value={item.type || ""}
                        onValueChange={(value) =>
                          handleOrderItemChange(index, "type", value)
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="product">Product</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                          <SelectItem value="delivery">
                            Delivery
                          </SelectItem>{" "}
                          {/* Added delivery type */}
                        </SelectContent>
                      </Select>
                    </div>

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
                        disabled={item.type === "delivery"} // Prevent editing delivery fee
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
                        disabled={item.type === "delivery"} // Typically, delivery fee quantity is 1
                      />
                    </div>
                  </div>

                  {/* Subtotal Display and Remove Button */}
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold">
                      Subtotal: {formatCurrency(item.subtotalInCents / 100)}
                    </div>
                    {item.type !== "delivery" && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeOrderItem(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex justify-end"></div>
            </div>
          </div>
          {/* Customer Selection */}
          <div className="flex-col w-full md:w-1/4">
            <div className="flex-col p-5 md:p-0 space-y-2 mt-2">
              <div className="space-y-2">
                <div className=" flex justify-between">
                  <Label htmlFor="userId">Customer</Label>
                  <FaPlus onClick={() => setIsUserModalOpen(true)} />
                </div>

                <UserAutocomplete
                  users={localUsers} // Use localUsers if managing locally
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

              {/* Enhanced Date Picker */}
              <div className="mt-4 space-y-2">
                <Label>Due Date</Label>
                <Popover
                  open={isDatePickerOpen}
                  onOpenChange={setIsDatePickerOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-between ${
                        !deliveryDate && "text-muted-foreground"
                      }`}
                    >
                      {deliveryDate
                        ? new Date(deliveryDate).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Pick a date"}
                      <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        deliveryDate ? new Date(deliveryDate) : undefined
                      }
                      onSelect={handleDateSelect}
                      disabled={(date) =>
                        date < new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Picker */}
              <div className="space-y-2 mt-4">
                <Label htmlFor="deliveryTime">Time</Label>
                <Input
                  type="time"
                  id="deliveryTime"
                  name="deliveryTime"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  required={isDelivery}
                />
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="flex-col w-full md:w-1/4 md:p-0 p-4 space-y-2">
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

            {/* Notes Section */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-[200px]"
                placeholder={`E.g.: \n\nThey will pay when they pick up\n - Don't forget message card \n\nmessage:\nHappy Birthday Tom!`}
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
        {/* Delivery Details Section */}
        {isDelivery && (
          <div className="w-full sm:w-2/3 mx-auto s">
            <div className="flex flex-col md:flex-row justify-between space-y-2 md:space-y-0 md:space-x-2">
              <div className="w-full sm:w-1/4">
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
              </div>
              <div className="w-full sm:w-1/4">
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
                    onBlur={handleCalculateDeliveryFee}
                    required={isDelivery}
                    maxLength={6}
                    pattern="[A-Za-z]\d[A-Za-z]\d[A-Za-z]\d"
                    placeholder="e.g., M5A1A1"
                  />
                </div>
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
                  className="flex md:h-[80%]"
                />
              </div>
            </div>
            <div>
              {/* Delivery Fee Section */}
              <div className="mt-4">
                {deliveryFee !== null && (
                  <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
                    <span>
                      Suggested Delivery Fee: {formatCurrency(deliveryFee)}
                    </span>
                    <Button
                      type="button"
                      onClick={handleAddDeliveryFee}
                      variant="secondary"
                    >
                      Add to Order
                    </Button>
                  </div>
                )}

                {feeError && <p className="text-red-500 mt-2">{feeError}</p>}
              </div>
            </div>
          </div>
        )}

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

        {submissionError && (
          <div className="text-red-500">{submissionError}</div>
        )}

        {/* Submit Button */}
        <SubmitButton />
      </form>

      {/* User Creation Modal */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Please fill out the form below to add a new user.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            {/* Add more fields as necessary */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsUserModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add User</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
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
