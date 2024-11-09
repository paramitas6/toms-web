// src/app/checkout/components/WaiverModal.tsx

"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface WaiverModalProps {
  showWaiver: boolean;
  setShowWaiver: (value: boolean) => void;
  waiverAccepted: boolean;
  setWaiverAccepted: (value: boolean) => void;
  handlePlaceOrder: () => void;
}

const WaiverModal: React.FC<WaiverModalProps> = ({
  showWaiver,
  setShowWaiver,
  waiverAccepted,
  setWaiverAccepted,
  handlePlaceOrder,
}) => {
  if (!showWaiver) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 w-11/12 md:w-1/2">
        <h2 className="text-2xl font-oSans mb-4 text-center">
        Please ensure the delivery address and instructions are correct.
        </h2>
        <p className="text-gray-700 mb-4">
          <br/>
          -If the recipient is not home, our delivery person will leave the flowers at the front door.
          <br/>
          <br/>
          -We are not responsible for any damage due to extreme weather conditions such as excessive heat or cold.
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
  );
};

export default WaiverModal;
