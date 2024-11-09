// src/app/(customerFacing)/checkout/components/GuestCheckout.tsx

"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { set } from "date-fns";

interface GuestCheckoutProps {
  isGuest: boolean;
  setIsGuest: (value: boolean) => void;
  guestEmail: string;
  setGuestEmail: (value: string) => void;
  disabled: boolean;
}

const GuestCheckout: React.FC<GuestCheckoutProps> = ({
  isGuest,
  guestEmail,
  setGuestEmail,
  disabled,
}) => {
  return (
    <div className="mb-6">
      {disabled ? (
        // When disabled is true, allow toggling guest checkout
<></>
      ) : (
        // When disabled is false, display the user's email as non-editable
        <div className="p-4 bg-gray-100 rounded">
        <Label className="flex items-center">

          <span className="ml-2">Currently Checking out as Guest</span>

      
        </Label>
        {isGuest && (
          <div className="mt-4">
            <Label htmlFor="guestEmail">Your Email*</Label>
            <Input
              id="guestEmail"
              type="email"
              placeholder="Enter your email"
              value={guestEmail}
              onBlur={(e) => setGuestEmail(e.target.value)}
              required
              className="mt-1 block w-full focus:border-red-500 focus:ring-red-500"
            />
          </div>
        )}
      </div>

      )}
    </div>
  );
};

export default GuestCheckout;
