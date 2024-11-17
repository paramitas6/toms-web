// src/app/(customerFacing)/checkout/components/GuestCheckout.tsx

"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface GuestCheckoutProps {
  isGuest: boolean;
  setIsGuest: (value: boolean) => void;
  guestEmail: string;
  setGuestEmail: (value: string) => void;
  guestPhone: string;
  setGuestPhone: (value: string) => void;
  disabled: boolean;
  setGuestName: (value: string) => void;
  guestName: string;
}

const GuestCheckout: React.FC<GuestCheckoutProps> = ({
  isGuest,
  guestEmail,
  setGuestEmail,
  guestName,
  setGuestName,
  guestPhone,
  setGuestPhone,
  disabled,
}) => {
  return (
    <div className="mb-6">
      {disabled ? (
        // Display a message when the checkout is disabled
        <></>
      ) : (
        // Display guest email and phone inputs
        <div className="p-4 bg-gray-100 rounded">
          <Label className="flex items-center">
            <span className="ml-2">Currently Checking out as Guest</span>
          </Label>
          {isGuest && (
            <div className="mt-4">
              <Label htmlFor="guestName">Name*</Label>
              <Input
                id="guestName"
                type="text"
                placeholder="Enter your name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                className="mt-1 block w-full focus:border-red-500 focus:ring-red-500"
              />

              <Label htmlFor="guestEmail">Email*</Label>
              <Input
                id="guestEmail"
                type="email"
                placeholder="Enter your email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
                className="mt-1 block w-full focus:border-red-500 focus:ring-red-500"
              />
              <Label htmlFor="guestPhone" className="mt-4 block">
                Phone*
              </Label>
              <Input
                id="guestPhone"
                type="tel"
                placeholder="Enter your phone number"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
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
