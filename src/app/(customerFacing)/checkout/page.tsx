// src/app/(customerFacing)/checkout/page.tsx

"use client";

import React, { useContext, useState, useEffect, useCallback } from "react";
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

declare global {
  function appendHelcimPayIframe(checkoutToken: string): void;
}

const schema = z.object({
  isGuest: z.boolean(),
  guestEmail: z.union([z.string().email(), z.literal(""), z.null()]).optional(),
  deliveryOption: z.enum(["pickup", "delivery"]),
  recipientName: z.string().optional(),
  recipientPhone: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  postalCode: z.string().optional(),
  selectedDate: z.string().min(1, "Delivery date is required."),
  selectedTime: z.string().min(1, "Delivery time is required."),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const CheckoutPage = () => {
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
    deliveryOption: "pickup",
    recipientName: "",
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

  const amountWithoutTax = cart.items.reduce(
    (acc, item) => acc + (item.quantity * item.priceInCents) / 100,
    0
  );
  const taxAmount = (amountWithoutTax + deliveryFee) * 0.13;
  const totalAmount = amountWithoutTax + taxAmount + deliveryFee;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

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
    setErrors({});
    return true;
  }, [formData, toast]);

  const processOrder = async (transaction: any, transactionId: string) => {
    try {
      const response = await fetch("/api/processOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: cart.items,
          deliveryOption: formData.deliveryOption,
          recipientName: formData.recipientName,
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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          description:
            errorData.message ||
            "Error processing order. Please contact support.",
        });
        setLoading(false);
        return;
      }

      const result = await response.json();
      const orderId = result.orderId;
      clearCart();
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

  const handlePaymentSuccess = async (
    transaction: any,
    transactionId: string
  ) => {
    await processOrder(transaction, transactionId);
  };

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
            errorData.message || "Error initiating payment. Please try again.",
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

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 10; hour < 18; hour += 2) {
      const startHour = hour % 12 === 0 ? 12 : hour % 12;
      const endHour = (hour + 2) % 12 === 0 ? 12 : (hour + 2) % 12;
      const period = hour < 12 ? "AM" : "PM";
      slots.push(`${startHour} ${period} - ${endHour} ${period}`);
    }
    return slots;
  };

  const [loadingUser, setLoadingUser] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/user", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        if (data.user) {
          setFormData((prev) => ({
            ...prev,
            isGuest: false,
            guestEmail: data.user.email,
          }));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  if (loadingUser) {
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
        <div className="w-2/3 mx-auto p-4">
          <h1 className="text-5xl font-gotham tracking-wider text-center m-8">
            Checkout
          </h1>

          {!formData.isGuest && (
            <div className="mb-4 p-4 bg-slate-50 rounded">
              <p>
                You are logged in as <strong>{formData.guestEmail}</strong>.
                Your email will be used for this checkout.
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
          <div className="flex mx-auto gap-4 font-montserrat">
            <div className="flex flex-col w-1/4">
              <GuestCheckout
                isGuest={formData.isGuest}
                setIsGuest={(value) =>
                  setFormData((prev) => ({ ...prev, isGuest: value }))
                }
                guestEmail={formData.guestEmail || ""}
                setGuestEmail={(value) =>
                  setFormData((prev) => ({ ...prev, guestEmail: value }))
                }
                disabled={!formData.isGuest}
              />

              <div className="">
                <div className="mb-4">
                  <Label htmlFor="selectedDate">Date*</Label>
                  <Input
                    type="date"
                    id="selectedDate"
                    name="selectedDate"
                    value={formData.selectedDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    required
                    className="mt-1 block w-full"
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="selectedTime">Time*</Label>
                  <Select
                    name="selectedTime"
                    value={formData.selectedTime}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        selectedTime: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Before 10AM">Before 10AM</SelectItem>
                      {generateTimeSlots().map((slot, idx) => (
                        <SelectItem key={idx} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mb-4">
                  <Label htmlFor="selectedTime">Your Contact Number</Label>
                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col w-full">
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
          />

          <div className="mt-6">
            <p className="text-center p-3 text-red-500">*Please note the you will not be charged at this time. Your order will be confirmed by our florist to ensure the freshest blooms before the transaction is processed.</p>
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
                    (formData.isGuest && !formData.guestEmail)))
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
