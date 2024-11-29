// src/components/CartItem.tsx

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { formatCurrency } from "@/lib/formatters";
import { MinusIcon, PlusIcon, TrashIcon } from "lucide-react";
import { CartItem as CartItemType } from "../../_components/CartComponent";
import { Textarea } from "@/components/ui/textarea";

interface CartItemProps {
  cartItem: CartItemType;
  incrementItemQuantity: (id: string) => void;
  decrementItemQuantity: (id: string) => void;
  deleteItemFromCart: (id: string) => void;
  updateCartItem: (item: CartItemType) => void;
  editableMessage: boolean;
  adjustableQuantity: boolean;
}

const CartItem: React.FC<CartItemProps> = ({
  cartItem,
  incrementItemQuantity,
  decrementItemQuantity,
  deleteItemFromCart,
  updateCartItem,
  editableMessage,
  adjustableQuantity,
}) => {
  const [message, setMessage] = useState(cartItem.cardMessage || "");

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    updateCartItem({ ...cartItem, cardMessage: e.target.value });
  };

  return (
    <div className="flex flex-col md:flex-row items-stretch  border-gray-200 h-full">
      {/* Product Image */}

      {editableMessage ? (
        <div className="w-full md:w-1/4  flex justify-center items-center ">
          <Image
            src={cartItem.image}
            alt={cartItem.name}
            width={350}
            height={350}
            className="object-cover"
          />
        </div>
      ) : (

          <div className="w-full md:w-1/4  flex justify-center items-center ">
            <Image
              src={cartItem.image}
              alt={cartItem.name}
              width={100}
              height={100}
              className="object-cover"
            />
          </div>

      )}

      {/* Product Info */}
      <div className="md:pl-6 mt-4 md:mt-0 flex flex-col justify-between h-full  w-full font-montserrat">
        <h2 className="text-4xl font-oSans text-black">{cartItem.name}</h2>
        <h2 className="text-xl font-oSans text-gray-700">{cartItem.size}</h2>

        <div className="flex flex-grow"></div>

        {/* Display or Edit the card message */}
        {editableMessage ? (
          <div className="flex flex-col w-full">
            <label className="text-sm  text-gray-600">Message:</label>
            <Textarea
              value={message}
              onChange={handleMessageChange}
              className="w-full"
            />
          </div>
        ) : (
          cartItem.cardMessage && (
            <p className="text-sm text-gray-600">
              Message: {cartItem.cardMessage}
            </p>
          )
        )}

        {/* Quantity and Price Section */}
        <div className="mt-4  flex items-center justify-between">
          {adjustableQuantity ? (
            <div className="flex items-center border border-gray-300">
              <button
                className="px-3 py-1 text-black hover:bg-red-100"
                onClick={() => decrementItemQuantity(cartItem.id)}
              >
                <MinusIcon className="w-4 h-4" />
              </button>
              <input
                type="number"
                className="w-12 h-10 text-center bg-white  border-gray-300 text-black no-spin"
                value={cartItem.quantity}
                readOnly
              />
              <button
                className="px-3 py-1 text-black hover:bg-red-100"
                onClick={() => incrementItemQuantity(cartItem.id)}
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <p className="text-lg">Quantity: {cartItem.quantity}</p>
          )}

          <div className="ml-6">
            <p className="text-lg font-semibold text-black">
              {formatCurrency(
                (cartItem.priceInCents * cartItem.quantity) / 100
              )}
            </p>
          </div>
          {/* Remove Item */}
          {editableMessage ? (
            <div className="ml-4">
              <button
                className="text-gray-500 hover:text-black"
                onClick={() => deleteItemFromCart(cartItem.id)}
              >
                <TrashIcon className="w-6 h-6" />
              </button>
            </div>
          ) : (
         null
          )}
        </div>
      </div>
    </div>
  );
};

export default CartItem;
