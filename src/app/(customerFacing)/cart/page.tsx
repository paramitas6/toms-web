// src/app/customerFacing/cart/page.tsx

"use client";

import React, { useContext } from "react";
import CartContext from "../_components/CartComponent";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CartItem from ".././checkout/_components/CartItems";
import { formatCurrency } from "@/lib/formatters";

const CartPage = () => {
  const {
    incrementItemQuantity,
    decrementItemQuantity,
    deleteItemFromCart,
    updateCartItem,
    cart,
  } = useContext(CartContext);

  const amountWithoutTax = cart.items.reduce(
    (acc, item) => acc + (item.quantity * item.priceInCents) / 100,
    0
  );

  const taxAmount = (amountWithoutTax * 0.13).toFixed(2);
  const totalAmount = (Number(amountWithoutTax) + Number(taxAmount)).toFixed(2);

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-gotham tracking-wider text-center m-8">
          Basket{" "}
          <span className="text-gray-500">({cart.items.length})</span>
        </h1>

        {cart.items.length > 0 ? (
          <div className="flex flex-col lg:flex-row lg:space-x-12">
            {/* Cart Items Section */}
            <div className="flex flex-col flex-1 h-auto space-y-8">
              {cart.items.map((cartItem) => (
                <CartItem
                  key={cartItem.id}
                  cartItem={cartItem}
                  incrementItemQuantity={incrementItemQuantity}
                  decrementItemQuantity={decrementItemQuantity}
                  deleteItemFromCart={deleteItemFromCart}
                  updateCartItem={updateCartItem}
                  editableMessage={true}
                  adjustableQuantity={true}
                />
              ))}

            </div>

            {/* Order Summary Section */}
            <aside className="w-full lg:w-1/3 mt-8 lg:mt-0 font-montserrat">
              <div className="bg-gray-50 p-6 mt-4">
                <h3 className="text-2xl font-oSans text-black mb-6">
                  Order Summary
                </h3>
                <ul className="space-y-4">
                  <li className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>{formatCurrency(amountWithoutTax)}</span>
                  </li>
                  <li className="flex justify-between text-gray-700">
                    <span>Delivery</span>
                    <span>Calculated at checkout</span>
                  </li>
                  <li className="flex justify-between text-gray-700">
                    <span>HST (13%)</span>
                    <span>${taxAmount}</span>
                  </li>

                  <li className="flex justify-between text-black font-semibold border-t border-gray-300 pt-4">
                    <span>Total Before Delivery</span>
                    <span className="text-black">${totalAmount}</span>
                  </li>
                </ul>
                <div className="mt-8">
                  <Link href="/checkout">
                    <Button
                      className="w-full bg-black text-white py-3 rounded hover:bg-gray-800"
                      type="submit"
                    >
                      Proceed to Checkout
                    </Button>
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="text-center text-black mt-10">
            <p className="text-xl">Your basket is empty.</p>
            <Link href="/shop">
              <Button className="mt-6 bg-black text-white py-3 px-6 rounded hover:bg-gray-800">
                Go Back to Shop
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
