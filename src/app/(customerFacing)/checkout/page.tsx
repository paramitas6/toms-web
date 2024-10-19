"use client";

import React, { useContext, useState, useEffect } from "react";
import CartContext, { CartItem } from "../_components/CartComponent";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Head from "next/head"; // Import Head to include scripts in the head section

declare global {
  function appendHelcimPayIframe(checkoutToken: string): void;
}

const CheckoutPage = () => {
  const { cart, clearCart } = useContext(CartContext);
  const [cartItems, setCartItems] = useState<CartItem[]>(cart.items);
  const [postalCode, setPostalCode] = useState<string>("");
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [deliveryFeeError, setDeliveryFeeError] = useState<string>("");
  const [loadingDeliveryFee, setLoadingDeliveryFee] = useState<boolean>(false);
  const [deliveryOption, setDeliveryOption] = useState<string>("pickup");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [recipientName, setRecipientName] = useState<string>("");
  const [deliveryAddress, setDeliveryAddress] = useState<string>("");
  const [deliveryInstructions, setDeliveryInstructions] = useState<string>("");
  const [showWaiver, setShowWaiver] = useState<boolean>(false);
  const [waiverAccepted, setWaiverAccepted] = useState<boolean>(false);

  const router = useRouter();

  const [secretToken, setSecretToken] = useState<string>("");
  const [checkoutToken, setCheckoutToken] = useState<string>(""); // Store checkoutToken for use in event listener

  const handleInputChange = (
    index: number,
    field: "cardMessage",
    value: string
  ) => {
    const updatedItems = [...cartItems];
    updatedItems[index][field] = value;
    setCartItems(updatedItems);
  };

  const handlePlaceOrder = async () => {
    if (deliveryOption === "delivery" && !waiverAccepted) {
      setShowWaiver(true);
      return;
    }

    const amount = totalAmount.toFixed(2);

    try {
      const response = await fetch("/api/initiatePayment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount, currency: "CAD" }),
      });

      const data = await response.json();
      console.log("Initiate Payment Response:", data);

      const { checkoutToken, secretToken } = data;
      setCheckoutToken(checkoutToken); // Store checkoutToken in state
      setSecretToken(secretToken);

      // Render the HelcimPay.js modal
      appendHelcimPayIframe(checkoutToken); // Call the function directly
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const amountWithoutTax = cartItems.reduce(
    (acc, item) => acc + (item.quantity * item.priceInCents) / 100,
    0
  );

  const taxAmount = (amountWithoutTax + deliveryFee) * 0.13;
  const totalAmount = amountWithoutTax + taxAmount + deliveryFee;

  useEffect(() => {
    const fetchDeliveryFee = async () => {
      if (deliveryOption !== "delivery" || postalCode.trim() === "") {
        setDeliveryFee(0);
        setDeliveryFeeError("");
        return;
      }

      setLoadingDeliveryFee(true);
      setDeliveryFeeError("");

      try {
        const response = await fetch("/api/getDeliveryFee", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ postalCode }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Unable to calculate delivery fee.");
        }

        const data = await response.json();
        setDeliveryFee(data.deliveryFeeInCents / 100); // Convert to dollars
      } catch (error: any) {
        setDeliveryFee(0);
        setDeliveryFeeError(error.message || "Unable to calculate delivery fee.");
      } finally {
        setLoadingDeliveryFee(false);
      }
    };

    fetchDeliveryFee();
  }, [postalCode, deliveryOption]);

  // Handle transaction response from HelcimPay.js
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      const helcimPayJsIdentifierKey = "helcim-pay-js-" + checkoutToken;

      if (event.data.eventName === helcimPayJsIdentifierKey) {
        if (event.data.eventStatus === "ABORTED") {
          console.error("Transaction failed!", event.data.eventMessage);

          // Remove the HelcimPay.js iFrame
          const frame = document.getElementById("helcimPayIframe");
          if (frame) {
            frame.remove();
          }
        }

        if (event.data.eventStatus === "SUCCESS") {
          console.log("Transaction success!", event.data.eventMessage);
          const transaction = JSON.parse(event.data.eventMessage);

          // Verify the transaction using secretToken
          const isValid = verifyTransaction(transaction, secretToken);

          if (isValid) {
            // Send order details and transaction data to backend
            try {
              const response = await fetch("/api/processOrder", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  cartItems,
                  deliveryOption,
                  recipientName,
                  deliveryAddress,
                  deliveryInstructions,
                  postalCode,
                  selectedDate,
                  selectedTime,
                  amountWithoutTax,
                  taxAmount,
                  deliveryFee,
                  totalAmount,
                  transaction,
                }),
              });

              if (!response.ok) {
                const errorData = await response.json();
                console.error("Error processing order:", errorData);
                return;
              }

              const result = await response.json();

              // Clear cart, redirect to order confirmation page, etc.
              clearCart();
              router.push("/order-confirmation");
            } catch (error) {
              console.error("Error:", error);
            }
          } else {
            console.error("Transaction verification failed.");
          }

          // Remove the HelcimPay.js iFrame
          const frame = document.getElementById("helcimPayIframe");
          if (frame) {
            frame.remove();
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [
    checkoutToken, // Added checkoutToken to dependencies
    cartItems,
    deliveryOption,
    recipientName,
    deliveryAddress,
    deliveryInstructions,
    postalCode,
    selectedDate,
    selectedTime,
    amountWithoutTax,
    taxAmount,
    deliveryFee,
    totalAmount,
    clearCart,
    secretToken,
  ]);

  // Function to verify transaction using secretToken
  const verifyTransaction = (transaction: any, secretToken: string): boolean => {
    // Implement verification logic as per Helcim's documentation
    return true;
  };

  // Generate time slots (2-hour intervals from 9 AM to 6 PM)
  const generateTimeSlots = () => {
    const timeSlots = [];
    for (let hour = 9; hour < 18; hour += 2) {
      const start = hour;
      const end = hour + 2;
      timeSlots.push(`${start}:00 - ${end}:00`);
    }
    return timeSlots;
  };

  return (
    <div className="min-h-screen py-8">
      <Head>
        <script
          type="text/javascript"
          src="https://secure.helcim.app/helcim-pay/services/start.js"
        ></script>
      </Head>
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-kuhlenbach text-center mb-6">
          Checkout
        </h1>

        {cartItems.length > 0 ? (
          <div className="flex flex-col lg:flex-row lg:space-x-8">
            {/* Checkout Items Section */}
            <div className="w-full lg:w-2/3">
              {cartItems.map((cartItem, index) => (
                <div
                  key={cartItem.productId}
                  className="flex flex-col md:flex-row items-center bg-white shadow-md rounded-lg p-4 mb-6"
                >
                  {/* Product Image */}
                  <div className="w-full md:w-1/3 flex justify-center">
                    <Image
                      src={cartItem.image}
                      alt={cartItem.name}
                      width={200}
                      height={200}
                      className="object-cover rounded-lg"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="w-full md:w-2/3 md:pl-6 mt-4 md:mt-0">
                    <h2 className="text-3xl font-kuhlenbach text-black ">
                      {cartItem.name}
                    </h2>
                    <p className="text-gray-700 mt-1">
                      {formatCurrency(cartItem.priceInCents / 100)} / item
                    </p>
                    <p className="text-gray-700">
                      Quantity: {cartItem.quantity}
                    </p>

                    {/* Card Message */}
                    <div className="mt-3">
                      <Label
                        htmlFor={`cardMessage-${index}`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        Card Message
                      </Label>
                      <textarea
                        id={`cardMessage-${index}`}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black focus:border-red-500 focus:ring-red-500"
                        rows={2}
                        placeholder="Enter a message to be attached..."
                        value={cartItem.cardMessage || ""}
                        onChange={(e) =>
                          handleInputChange(index, "cardMessage", e.target.value)
                        }
                      ></textarea>
                    </div>
                  </div>
                </div>
              ))}

              <div className="text-center">
                <Link href="/shop" className="text-red-600 hover:text-red-800">
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order Summary Section */}
            <aside className="w-full lg:w-1/3 mt-8 lg:mt-0">
              <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-2xl font-kuhlenbach text-black mb-4 text-center">
                  Order Summary
                </h3>
                <div className="space-y-4">
                  {/* Delivery Option */}
                  <div>
                    <Label className="block text-sm font-medium text-gray-700">
                      Choose an Option
                    </Label>
                    <div className="mt-2 flex justify-around">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio text-red-500"
                          name="deliveryOption"
                          value="pickup"
                          checked={deliveryOption === "pickup"}
                          onChange={() => setDeliveryOption("pickup")}
                        />
                        <span className="ml-2">Pickup</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio text-red-500"
                          name="deliveryOption"
                          value="delivery"
                          checked={deliveryOption === "delivery"}
                          onChange={() => setDeliveryOption("delivery")}
                        />
                        <span className="ml-2">Delivery</span>
                      </label>
                    </div>
                  </div>

                  {/* Delivery Details */}
                  {deliveryOption === "delivery" && (
                    <div className="space-y-4">
                      {/* Recipient Name */}
                      <div>
                        <Label htmlFor="recipientName">Recipient Name</Label>
                        <Input
                          id="recipientName"
                          type="text"
                          placeholder="Enter recipient's name"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          className="mt-1 focus:border-red-500 focus:ring-red-500"
                        />
                      </div>

                      {/* Delivery Address */}
                      <div>
                        <Label htmlFor="deliveryAddress">Delivery Address</Label>
                        <textarea
                          id="deliveryAddress"
                          placeholder="Enter delivery address"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black focus:border-red-500 focus:ring-red-500"
                          rows={2}
                        ></textarea>
                      </div>

                      {/* Delivery Instructions */}
                      <div>
                        <Label htmlFor="deliveryInstructions">
                          Delivery Instructions
                        </Label>
                        <textarea
                          id="deliveryInstructions"
                          placeholder="Enter any delivery instructions..."
                          value={deliveryInstructions}
                          onChange={(e) =>
                            setDeliveryInstructions(e.target.value)
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black focus:border-red-500 focus:ring-red-500"
                          rows={2}
                        ></textarea>
                      </div>

                      {/* Postal Code Input */}
                      <div>
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          type="text"
                          placeholder="Enter postal code"
                          value={postalCode}
                          onChange={(e) =>
                            setPostalCode(e.target.value.toUpperCase())
                          }
                          className="mt-1 focus:border-red-500 focus:ring-red-500"
                        />
                        {deliveryFeeError && (
                          <p className="text-red-600 text-sm mt-1">
                            {deliveryFeeError}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Date Selection */}
                  <div>
                    <Label htmlFor="deliveryDate">Select Date</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="mt-1 w-full focus:border-red-500 focus:ring-red-500"
                    />
                  </div>

                  {/* Time Window Selection */}
                  <div>
                    <Label htmlFor="deliveryTime">Select Time Window</Label>
                    <select
                      id="deliveryTime"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black focus:border-red-500 focus:ring-red-500"
                    >
                      <option value="">Select a time window</option>
                      {generateTimeSlots().map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>

                  <ul className="space-y-2 mt-4">
                    <li className="flex justify-between text-gray-700">
                      <span>Subtotal</span>
                      <span>{formatCurrency(amountWithoutTax)}</span>
                    </li>
                    <li className="flex justify-between text-gray-700">
                      <span>13% HST</span>
                      <span>${taxAmount.toFixed(2)}</span>
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
                    <li className="flex justify-between text-black font-semibold border-t border-gray-300 pt-2">
                      <span>Total</span>
                      <span className="text-black">
                        {formatCurrency(totalAmount)}
                      </span>
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Button
                      className="w-full bg-red-500 text-white py-3 rounded hover:bg-red-600"
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={
                        !selectedDate ||
                        !selectedTime ||
                        (deliveryOption === "delivery" &&
                          (!postalCode ||
                            !recipientName ||
                            !deliveryAddress ||
                            !!deliveryFeeError ||
                            loadingDeliveryFee))
                      }
                    >
                      Place Order
                    </Button>
                    <Link
                      href="/cart"
                      className="mt-4 block text-center text-red-600 hover:text-red-800"
                    >
                      Back to Cart
                    </Link>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="text-center text-black mt-8">
            <p className="text-xl">Your cart is empty.</p>
            <Link href="/shop">
              <Button className="mt-4 bg-red-500 text-white py-3 px-6 rounded hover:bg-red-600">
                Go Back to Shop
              </Button>
            </Link>
          </div>
        )}

        {/* Waiver Modal */}
        {showWaiver && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-11/12 md:w-1/2">
              <h2 className="text-xl font-kuhlenbach mb-4 text-center">
                Please Review Your Delivery Details
              </h2>
              <p className="text-gray-700 mb-4">
                Please ensure the delivery address and instructions are correct.
                If the recipient is not home, our delivery person will leave the
                flowers at the front door. We are not responsible for any damage
                due to extreme weather conditions such as excessive heat or
                cold.
              </p>
              <div className="flex items-center mb-4">
                <input
                  id="waiverAccepted"
                  type="checkbox"
                  checked={waiverAccepted}
                  onChange={(e) => setWaiverAccepted(e.target.checked)}
                  className="form-checkbox text-red-500"
                />
                <label
                  htmlFor="waiverAccepted"
                  className="ml-2 text-gray-700"
                >
                  I have double-checked the address and accept the terms.
                </label>
              </div>
              <div className="flex justify-end space-x-4">
                <Button
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                  onClick={() => setShowWaiver(false)}
                >
                  Cancel
                </Button>
                <Button
                  className={`py-2 px-4 rounded ${
                    waiverAccepted
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-gray-300 text-gray-700 cursor-not-allowed"
                  }`}
                  onClick={() => {
                    if (waiverAccepted) {
                      setShowWaiver(false);
                      // Proceed to place order
                      handlePlaceOrder(); // Call handlePlaceOrder to continue
                    }
                  }}
                  disabled={!waiverAccepted}
                >
                  Confirm Order
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
