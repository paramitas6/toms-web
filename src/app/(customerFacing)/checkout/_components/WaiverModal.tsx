// src/app/checkout/components/WaiverModal.tsx

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface WaiverModalProps {
  showWaiver: boolean;
  setShowWaiver: (value: boolean) => void;
  waiverAccepted: boolean;
  setWaiverAccepted: (value: boolean) => void;
  handlePlaceOrder: () => void;
  // New props for delivery details
  deliveryAddress: string;
  deliveryInstructions: string;
  deliveryDate: string;
  deliveryTime: string;
}

const WaiverModal: React.FC<WaiverModalProps> = ({
  showWaiver,
  setShowWaiver,
  waiverAccepted,
  setWaiverAccepted,
  handlePlaceOrder,
  deliveryAddress,
  deliveryInstructions,
  deliveryDate,
  deliveryTime,
}) => {
  if (!showWaiver) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      aria-modal="true"
      role="dialog"
      aria-labelledby="waiverModalTitle"
      aria-describedby="waiverModalDescription"
    >
      <div className="bg-white rounded-lg shadow-lg p-8 w-11/12 max-w-md md:w-1/2 overflow-y-auto max-h-full">
        <h2
          id="waiverModalTitle"
          className="text-2xl font-semibold mb-4 text-center text-gray-800"
        >
          Please Confirm Your Delivery Details
        </h2>

        {/* Delivery Details Section */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Delivery Details:</h3>
          <div className="space-y-2">
            <div>
              <strong>Delivery Address:</strong>
              <p>{deliveryAddress || "N/A"}</p>
            </div>
            <div>
              <strong>Delivery Instructions:</strong>
              <p>{deliveryInstructions || "N/A"}</p>
            </div>
            <div>
              <strong>Delivery Date:</strong>
              <p>
                {deliveryDate
                  ? new Date(deliveryDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <strong>Delivery Time:</strong>
              <p>{deliveryTime || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Waiver Terms Section */}
        <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
          <li>
            If the recipient isn't home, we'll leave the flowers at the front
            door.
          </li>
          <li>
            We're not responsible for damage caused by extreme weather, like
            very hot or cold conditions.
          </li>
          <li>
            If any delivery details are incorrect or missing, your order will be
            returned to the store. You can either:
            <ul className="list-circle list-inside mt-2">
              <li>- Pick up your order from the store</li>
              <li>- Pay for an additional delivery attempt</li>
            </ul>
          </li>
        </ul>

        {/* Contact Note */}
        <p className="text-red-600 mb-6">
          *We will attempt to contact the recipient prior to delivery.
        </p>

        {/* Acceptance Checkbox */}
        <div className="flex items-center mb-6">
          <input
            id="waiverAccepted"
            type="checkbox"
            checked={waiverAccepted}
            onChange={(e) => setWaiverAccepted(e.target.checked)}
            className="form-checkbox h-5 w-5 text-red-500"
          />
          <Label htmlFor="waiverAccepted" className="ml-3 text-gray-700">
            I’ve reviewed my delivery details and agree to the terms.
          </Label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            variant="secondary"
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
            onClick={() => setShowWaiver(false)}
          >
            Cancel
          </Button>
          <Button
            className={`px-4 py-2 rounded-md ${
              waiverAccepted
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gray-300 text-gray-700 cursor-not-allowed"
            }`}
            onClick={() => {
              if (waiverAccepted) {
                setShowWaiver(false);
                handlePlaceOrder();
              }
            }}
            disabled={!waiverAccepted}
          >
            Confirm Order
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WaiverModal
