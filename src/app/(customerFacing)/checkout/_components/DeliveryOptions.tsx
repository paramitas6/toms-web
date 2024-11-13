// src/app/checkout/components/DeliveryOptions.tsx

"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { calculateDeliveryFee } from "@/lib/deliveryFee"; // Import the deliveryFee module

interface DeliveryOptionsProps {
  deliveryOption: string;
  setDeliveryOption: (option: string) => void;
  recipientName: string;
  setRecipientName: (value: string) => void;
  recipientPhone: string;
  setRecipientPhone: (value: string) => void;
  deliveryAddress: string;
  setDeliveryAddress: (value: string) => void;
  deliveryInstructions: string;
  setDeliveryInstructions: (value: string) => void;
  postalCode: string;
  setPostalCode: (value: string) => void;
  deliveryFeeError: string;
  setDeliveryFeeError: (error: string) => void;
  loadingDeliveryFee: boolean;
  setLoadingDeliveryFee: (loading: boolean) => void;
  deliveryFee?: number;
  setDeliveryFee?: (fee: number) => void;
}

const DeliveryOptions: React.FC<DeliveryOptionsProps> = ({
  deliveryOption,
  setDeliveryOption,
  recipientName,
  setRecipientName,
  recipientPhone,
  setRecipientPhone,
  deliveryAddress,
  setDeliveryAddress,
  deliveryInstructions,
  setDeliveryInstructions,
  postalCode,
  setPostalCode,
  deliveryFeeError,
  setDeliveryFeeError,
  loadingDeliveryFee,
  setLoadingDeliveryFee,
  deliveryFee,
  setDeliveryFee,
}) => {
  // Handler to calculate delivery fee onBlur
  const handlePostalCodeBlur = () => {
    if (deliveryOption === "delivery" && postalCode.trim() !== "") {
      const originPostal = "M5N"; // Fixed origin as per your requirement
      const destinationPostal = postalCode.trim().toUpperCase();

      // Start loading
      setLoadingDeliveryFee(true);
      setDeliveryFeeError(""); // Reset any previous errors

      try {
        const fee = calculateDeliveryFee(originPostal, destinationPostal);
        if (setDeliveryFee) {
          setDeliveryFee(fee); // Pass the fee to parent if setter is provided
        }
      } catch (error: any) {
        setDeliveryFeeError(
          error.message || "Failed to calculate delivery fee."
        );
        if (setDeliveryFee) {
          setDeliveryFee(0); // Reset fee if there's an error
        }
      } finally {
        setLoadingDeliveryFee(false); // Stop loading
      }
    } else {
      // If not delivery option or postal code is empty, reset the fee and error
      if (setDeliveryFee) {
        setDeliveryFee(0);
      }
      setDeliveryFeeError("");
      setLoadingDeliveryFee(false);
    }
  };

  // Optional: Calculate fee immediately if deliveryOption is 'delivery' and postalCode is already filled
  React.useEffect(() => {
    if (deliveryOption === "delivery" && postalCode.trim() !== "") {
      handlePostalCodeBlur();
    } else {
      // Reset if delivery option is not delivery
      if (setDeliveryFee) {
        setDeliveryFee(0);
      }
      setDeliveryFeeError("");
      setLoadingDeliveryFee(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryOption]);

  return (
    <>
      {/* Delivery Option */}
      <div>
        <div className="m-5 flex justify-around">
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
        <>
          <div className="flex w-2/3 justify-between gap-5 mx-auto">
            <div className="space-y-4 flex flex-col w-1/2">
              {/* Recipient Name */}
              <div className="">
                <Label htmlFor="recipientName">Recipient Name</Label>
                <Input
                  id="recipientName"
                  type="text"
                  placeholder="Enter recipient's name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  required
                  className="mt-1 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              {/* Recipient Name */}
              <div className="">
                <Label htmlFor="recipientPhone">Recipient Phone</Label>
                <Input
                  id="recipientPhone"
                  type="tel"
                  placeholder="Enter recipient's Phone Number"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  required
                  className="mt-1 focus:border-red-500 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="flex-col w-1/2">
              {/* Delivery Address */}
              <div>
                <Label htmlFor="deliveryAddress">Street Address</Label>
                <Input
                  id="deliveryAddress"
                  placeholder="Enter delivery address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black focus:border-red-500 focus:ring-red-500"
                ></Input>
              </div>

              {/* Postal Code Input */}
              <div className="mt-4">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  type="text"
                  placeholder="Enter postal code"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value.toUpperCase())}
                  onBlur={handlePostalCodeBlur} // Attach onBlur handler
                  required
                  className="mt-1 focus:border-red-500 focus:ring-red-500"
                />
              </div>
            </div>
          </div>
          {/* Delivery Instructions */}
          <div className="w-2/3 mx-auto mt-5">
            <div>
              <Label htmlFor="deliveryInstructions">
                Buzzer Code / Other Instructions
              </Label>
              <textarea
                id="deliveryInstructions"
                placeholder="*Important: Missing buzzer code or other instructions may result in unsuccessful delivery."
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black focus:border-red-500 focus:ring-red-500"
                rows={2}
              ></textarea>
            </div>

            {/* Delivery Fee */}
            <div className="text-end">
              {deliveryFeeError && (
                <p className="text-red-600 text-sm mt-1">{deliveryFeeError}</p>
              )}
              {loadingDeliveryFee && (
                <p className="text-gray-600 text-sm mt-1">Calculating...</p>
              )}
              {/* Optional: Display the calculated delivery fee */}
              {deliveryFee !== undefined &&
                !loadingDeliveryFee &&
                !deliveryFeeError && (
                  <p className="text-green-600 text-sm mt-1">
                    Delivery Fee: ${deliveryFee.toFixed(2)}
                  </p>
                )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default DeliveryOptions;
