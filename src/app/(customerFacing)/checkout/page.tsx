"use client";

import React, { useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react"; // Import useSession
import CartContext from "@/app/(customerFacing)/_components/CartComponent";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import DeliveryOptions from "./_components/DeliveryOptions";
import CartItem from "./_components/CartItems";
import OrderSummary from "./_components/OrderSummary";
import GuestCheckout from "./_components/GuestCheckout";
import WaiverModal from "./_components/WaiverModal";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Phone } from "lucide-react";
import { v4 as uuidv4 } from "uuid"; // Ensure UUID is imported
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

declare global {
  function appendHelcimPayIframe(checkoutToken: string): void;
}

// Enhanced Zod schema with conditional requirements
const schema = z.object({
  isGuest: z.boolean(),
  guestEmail: z.string().email().optional().or(z.literal("")).or(z.null()),
  guestName: z.string().optional().or(z.literal("")).or(z.null()),
  guestPhone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .optional()
    .or(z.literal("")),
  deliveryOption: z.enum(["pickup", "delivery"]),
  recipientName: z.string().optional(),
  recipientPhone: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  postalCode: z.string().optional(),
  selectedDate: z
    .string()
    .min(1, "Delivery date is required.")
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid delivery date format.",
    }),
  selectedTime: z.string().min(1, "Delivery time is required."),
});

type FormData = z.infer<typeof schema>;

const CheckoutPage = () => {
  const { data: session, status } = useSession(); // Use useSession hook
  const { cart, clearCart } = useContext(CartContext);
  const router = useRouter();
  const { toast } = useToast();
  const [showWaiver, setShowWaiver] = useState<boolean>(false);
  const [waiverAccepted, setWaiverAccepted] = useState<boolean>(false);
  const [secretToken, setSecretToken] = useState<string>("");
  const [checkoutToken, setCheckoutToken] = useState<string>("");
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    isGuest: true,
    guestEmail: "",
    guestPhone: "",
    deliveryOption: "pickup",
    recipientName: "",
    recipientPhone: "",
    deliveryAddress: "",
    deliveryInstructions: "",
    postalCode: "",
    selectedDate: "",
    selectedTime: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [deliveryFeeError, setDeliveryFeeError] = useState<string>("");
  const [loadingDeliveryFee, setLoadingDeliveryFee] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);

  // Calculate amounts
  const amountWithoutTax = cart.items.reduce(
    (acc, item) => acc + (item.quantity * item.priceInCents) / 100,
    0
  );
  const taxAmount = (amountWithoutTax + deliveryFee) * 0.13;
  const totalAmount = amountWithoutTax + taxAmount + deliveryFee;

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Format the date as YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;
      setFormData((prev) => ({
        ...prev,
        selectedDate: formattedDate,
      }));
      // Close the date picker popover
      setIsDatePickerOpen(false);
    }
  };

  // Enhanced validation with conditional logic
  const validate = useCallback(() => {
    const result = schema.safeParse(formData);
    if (!result.success) {
      const newErrors: { [key: string]: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) newErrors[err.path[0] as string] = err.message;
      });
      setErrors(newErrors);
      Object.values(newErrors).forEach((message) => {
        toast({
          variant: "destructive",
          description: message,
        });
      });
      return false;
    }

    // Additional conditional validations
    if (formData.deliveryOption === "delivery") {
      if (!formData.recipientName) {
        setErrors((prev) => ({
          ...prev,
          recipientName: "Recipient name is required for delivery.",
        }));
        toast({
          variant: "destructive",
          description: "Recipient name is required for delivery.",
        });
        return false;
      }
      if (!formData.recipientPhone) {
        setErrors((prev) => ({
          ...prev,
          recipientPhone: "Recipient phone is required for delivery.",
        }));
        toast({
          variant: "destructive",
          description: "Recipient phone is required for delivery.",
        });
        return false;
      }
      if (!formData.deliveryAddress) {
        setErrors((prev) => ({
          ...prev,
          deliveryAddress: "Delivery address is required for delivery.",
        }));
        toast({
          variant: "destructive",
          description: "Delivery address is required for delivery.",
        });
        return false;
      }
      if (!formData.postalCode) {
        setErrors((prev) => ({
          ...prev,
          postalCode: "Postal code is required for delivery.",
        }));
        toast({
          variant: "destructive",
          description: "Postal code is required for delivery.",
        });
        return false;
      }
    }

    if (formData.isGuest && !formData.guestEmail) {
      setErrors((prev) => ({
        ...prev,
        guestEmail: "Guest email is required.",
      }));
      toast({
        variant: "destructive",
        description: "Guest email is required.",
      });
      return false;
    }

    if (formData.isGuest && !formData.guestPhone) {
      setErrors((prev) => ({
        ...prev,
        guestPhone: "Guest phone number is required.",
      }));
      toast({
        variant: "destructive",
        description: "Guest phone number is required.",
      });
      return false;
    }

    // Optional: Validate if selectedDate is a valid date string
    if (formData.selectedDate) {
      const date = new Date(formData.selectedDate);
      if (isNaN(date.getTime())) {
        setErrors((prev) => ({
          ...prev,
          selectedDate: "Invalid delivery date.",
        }));
        toast({
          variant: "destructive",
          description: "Invalid delivery date.",
        });
        return false;
      }
    }

    setErrors({});
    return true;
  }, [formData, toast]);

  // Process order and handle API response
  const processOrder = async (transaction: any, transactionId: string) => {
    try {
      const response = await fetch("/api/processOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Map cartItems to include 'type' field
          cartItems: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceInCents: item.priceInCents,
            name: item.name,
            type: "product", // Set 'type' as 'product' or determine based on your logic
          })),
          deliveryOption: formData.deliveryOption,
          recipientName: formData.recipientName,
          recipientPhone: formData.recipientPhone,
          deliveryAddress: formData.deliveryAddress,
          deliveryInstructions: formData.deliveryInstructions,
          postalCode: formData.postalCode,
          selectedDate: formData.selectedDate,
          selectedTime: formData.selectedTime,
          amountWithoutTax,
          taxAmount,
          deliveryFee,
          totalAmount,
          transaction,
          transactionId,
          secretToken,
          isGuest: formData.isGuest,
          guestEmail: formData.isGuest ? formData.guestEmail : "",
          guestPhone: formData.isGuest ? formData.guestPhone : "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          description:
            errorData.error ||
            "Error processing order. Please contact support.",
        });
        setLoading(false);
        return;
      }

      const result = await response.json();
      const orderId = result.orderId;
      clearCart();
      router.push(`/order-confirmation?orderId=${orderId}`);
      window.location.href = `/order-confirmation?orderId=${orderId}`;
    } catch (error) {
      console.error("Error processing order:", error);
      toast({
        variant: "destructive",
        description: "Error processing order. Please try again.",
      });
      setLoading(false);
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = async (
    transaction: any,
    transactionId: string
  ) => {
    await processOrder(transaction, transactionId);
  };

  // Handle messages from the payment iframe
  const handleMessage = useCallback(
    async (event: MessageEvent) => {
      const identifier = "helcim-pay-js-" + checkoutToken;
      if (event.data.eventName === identifier) {
        if (event.data.eventStatus === "ABORTED") {
          toast({
            variant: "destructive",
            description: "Transaction failed! Please try again.",
          });
          const frame = document.getElementById("helcimPayIframe");
          frame?.remove();
          setLoading(false);
        }
        if (event.data.eventStatus === "SUCCESS") {
          const transaction =
            typeof event.data.eventMessage === "string"
              ? JSON.parse(event.data.eventMessage)
              : event.data.eventMessage;
          const transactionId = transaction.data?.data?.transactionId;
          await handlePaymentSuccess(transaction, transactionId);
        }
      }
    },
    [checkoutToken, handlePaymentSuccess, toast]
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;
    if (formData.deliveryOption === "delivery" && !waiverAccepted) {
      setShowWaiver(true);
      return;
    }

    setLoading(true);

    const amount = totalAmount.toFixed(2);
    try {
      const response = await fetch("/api/initiatePayment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, type: "preauth", currency: "CAD" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          description:
            errorData.error || "Error initiating payment. Please try again.",
        });
        setLoading(false);
        return;
      }

      const dataResponse = await response.json();
      const { checkoutToken, secretToken } = dataResponse;

      if (!checkoutToken || !secretToken) {
        toast({
          variant: "destructive",
          description: "Missing tokens in response. Please contact support.",
        });
        setLoading(false);
        return;
      }

      setCheckoutToken(checkoutToken);
      setSecretToken(secretToken);

      if (typeof appendHelcimPayIframe === "function") {
        appendHelcimPayIframe(checkoutToken);
      } else {
        toast({
          variant: "destructive",
          description: "Payment processing error. Please try again.",
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast({
        variant: "destructive",
        description: "Error initiating payment. Please try again.",
      });
      setLoading(false);
    }
  };

  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 16; hour += 2) {
      const startHour = hour % 12 === 0 ? 12 : hour % 12;
      const endHour = (hour + 2) % 12 === 0 ? 12 : (hour + 2) % 12;
      const period = hour < 12 ? "AM" : "PM";
      slots.push(`${startHour} ${period} - ${endHour} ${period}`);
    }
    return slots;
  };

  // Pre-populate form data when session data is available
  useEffect(() => {
    if (status === "authenticated" && session.user) {
      setFormData((prev) => ({
        ...prev,
        isGuest: false,
        guestEmail: session.user.email || "",
        guestPhone: session.user.phone || "",
        recipientName: session.user.name || "",
        recipientPhone: session.user.phone || "",
      }));
    }
  }, [status, session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://secure.helcim.app/helcim-pay/services/start.js"
        onLoad={() => setScriptLoaded(true)}
        onError={(e) => {
          toast({
            variant: "destructive",
            description: "Failed to load payment script. Please try again.",
          });
        }}
      />
      <div className="min-h-screen py-8">
        <div className="w-full lg:w-2/3 mx-auto p-4">
          <h1 className="text-5xl font-gotham tracking-wider text-center m-8">
            Checkout
          </h1>

          {!formData.isGuest && (
            <div className="mb-4 p-4 bg-slate-50 rounded">
              <p>
                You are logged in as <strong>{formData.guestEmail}</strong>.
                Your email and phone will be used for this checkout.
              </p>
            </div>
          )}

          <DeliveryOptions
            deliveryOption={formData.deliveryOption}
            setDeliveryOption={(option: string) => {
              if (option === "pickup" || option === "delivery") {
                setFormData((prev) => ({
                  ...prev,
                  deliveryOption: option,
                }));
              }
            }}
            recipientName={formData.recipientName || ""}
            setRecipientName={(value) =>
              setFormData((prev) => ({ ...prev, recipientName: value }))
            }
            recipientPhone={formData.recipientPhone || ""}
            setRecipientPhone={(value) =>
              setFormData((prev) => ({ ...prev, recipientPhone: value }))
            }
            deliveryAddress={formData.deliveryAddress || ""}
            setDeliveryAddress={(value) =>
              setFormData((prev) => ({ ...prev, deliveryAddress: value }))
            }
            deliveryInstructions={formData.deliveryInstructions || ""}
            setDeliveryInstructions={(value) =>
              setFormData((prev) => ({
                ...prev,
                deliveryInstructions: value,
              }))
            }
            postalCode={formData.postalCode || ""}
            setPostalCode={(value) =>
              setFormData((prev) => ({ ...prev, postalCode: value }))
            }
            deliveryFeeError={deliveryFeeError}
            setDeliveryFeeError={setDeliveryFeeError}
            loadingDeliveryFee={loadingDeliveryFee}
            setLoadingDeliveryFee={setLoadingDeliveryFee}
            deliveryFee={deliveryFee}
            setDeliveryFee={setDeliveryFee}
          />

          {/* Date Picker Integration */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              When would you like your order?
            </label>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-between ${
                    !formData.selectedDate && "text-muted-foreground"
                  }`}
                >
                  {formData.selectedDate
                    ? new Date(formData.selectedDate).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "Pick a date"}
                  <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    formData.selectedDate
                      ? new Date(formData.selectedDate)
                      : undefined
                  }
                  onSelect={handleDateSelect}
                  disabled={(date) =>
                    date < new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.selectedDate && (
              <p className="mt-1 text-sm text-red-600">{errors.selectedDate}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Please select your preferred delivery date.
            </p>
          </div>

          {/* Time Picker */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What time should we deliver?
            </label>
            <Select
              value={formData.selectedTime}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  selectedTime: value,
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Please select a preferred time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem disabled value="10 AM">
                  For non-standard delivery times or precise scheduling, kindly
                  reach out to us.
                </SelectItem>
                {generateTimeSlots().map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.selectedTime && (
              <p className="mt-1 text-sm text-red-600">{errors.selectedTime}</p>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:gap-4 md: mx-auto gap-4 font-montserrat mt-8">
            {/* Guest Checkout Section */}
            <div className="w-full md:w-1/4">
              <GuestCheckout
                isGuest={formData.isGuest}
                setIsGuest={(value) =>
                  setFormData((prev) => ({ ...prev, isGuest: value }))
                }
                guestEmail={formData.guestEmail || ""}
                setGuestEmail={(value) =>
                  setFormData((prev) => ({ ...prev, guestEmail: value }))
                }
                guestPhone={formData.guestPhone || ""}
                setGuestPhone={(value) =>
                  setFormData((prev) => ({ ...prev, guestPhone: value }))
                }
                guestName={formData.guestName || ""}
                setGuestName={(value) =>
                  setFormData((prev) => ({ ...prev, guestName: value }))
                }
                disabled={!formData.isGuest}
              />

              {/* Recipient Details */}
              {!formData.isGuest && formData.deliveryOption === "pickup" && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                  <p className="text-center">Welcome</p>
                </div>
              )}
            </div>

            {/* Order Items and Summary Section */}
            <div className="w-full md:w-3/4">
              {cart.items.length > 0 ? (
                <div className="flex flex-col lg:flex-row lg:space-x-8">
                  <div className="w-full p-6">
                    <div className="space-y-2">
                      {cart.items.map((cartItem) => (
                        <CartItem
                          key={cartItem.id}
                          cartItem={cartItem}
                          incrementItemQuantity={() => {}}
                          decrementItemQuantity={() => {}}
                          deleteItemFromCart={() => {}}
                          updateCartItem={() => {}}
                          editableMessage={false}
                          adjustableQuantity={false}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-black mt-8">
                  <Link href="/shop">
                    <Button className="mt-4 border-none bg-white text-black-800 hover:bg-red-200">
                      Go Back to Shop
                    </Button>
                  </Link>
                </div>
              )}
              <div className="p-6">
                <OrderSummary
                  amountWithoutTax={amountWithoutTax}
                  taxAmount={taxAmount}
                  deliveryFee={deliveryFee}
                  deliveryOption={formData.deliveryOption}
                  loadingDeliveryFee={loadingDeliveryFee}
                  deliveryFeeError={deliveryFeeError}
                  totalAmount={totalAmount}
                />
              </div>
            </div>
          </div>

          <WaiverModal
            showWaiver={showWaiver}
            setShowWaiver={setShowWaiver}
            waiverAccepted={waiverAccepted}
            setWaiverAccepted={setWaiverAccepted}
            handlePlaceOrder={() => handleSubmit()}
            deliveryAddress={formData.deliveryAddress || ""}
            deliveryInstructions={formData.deliveryInstructions || ""}
            deliveryDate={formData.selectedDate}
            deliveryTime={formData.selectedTime}
          />

          <div className="mt-6">
            <p className="text-center p-3 text-gray-600">
              *Please note that you will not be charged at this time. Your order
              will be confirmed by our florist to ensure the freshest blooms
              before the transaction is processed.
            </p>
            <Button
              className="w-full bg-black text-white py-3 hover:bg-gray-800 font-oSans text-lg"
              type="button"
              onClick={() => handleSubmit()}
              disabled={
                loading ||
                !formData.selectedDate ||
                !formData.selectedTime ||
                (formData.deliveryOption === "delivery" &&
                  (!formData.postalCode ||
                    !formData.recipientName ||
                    !formData.recipientPhone ||
                    !formData.deliveryAddress ||
                    !!deliveryFeeError ||
                    loadingDeliveryFee ||
                    (formData.isGuest &&
                      (!formData.guestEmail || !formData.guestPhone))))
              }
            >
              {loading ? "Processing..." : "Place Order"}
            </Button>
            <Link
              href="/cart"
              className="mt-4 block text-center text-red-600 hover:text-red-800 font-oSans"
            >
              Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
