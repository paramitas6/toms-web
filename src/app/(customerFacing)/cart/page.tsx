"use client";

import React, { useContext } from "react";
import CartContext, { CartItem } from "../_components/CartComponent";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon, TrashIcon } from "lucide-react";

const CartPage = () => {
  const { addItemToCart, deleteItemFromCart, cart } = useContext(CartContext);

  const increaseQty = (cartItem: CartItem) => {
    const newQty = cartItem.quantity + 1;
    const item = { ...cartItem, quantity: newQty };
    addItemToCart(item);
  };

  const decreaseQty = (cartItem: CartItem) => {
    const newQty = cartItem.quantity - 1;
    if (newQty <= 0) return;
    const item = { ...cartItem, quantity: newQty };
    addItemToCart(item);
  };

  const amountWithoutTax = cart.items.reduce(
    (acc, item) => acc + (item.quantity * item.priceInCents) / 100,
    0
  );

  const taxAmount = (amountWithoutTax * 0.13).toFixed(2);
  const totalAmount = (Number(amountWithoutTax) + Number(taxAmount)).toFixed(2);

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-kuhlenbach text-center mb-8">
          In the Basket <span className="text-gray-500">({cart.items.length})</span>
        </h1>

        {cart.items.length > 0 ? (
          <div className="flex flex-col lg:flex-row lg:space-x-12">
            {/* Cart Items Section */}
            <div className="flex-1">
              {cart.items.map((cartItem, index) => (
                <div
                  key={cartItem.productId}
                  className="flex flex-col md:flex-row items-center border-b border-gray-200 py-6"
                >
                  {/* Product Image */}
                  <div className="w-full md:w-1/4">
                    <Image
                      src={cartItem.image}
                      alt={cartItem.name}
                      width={350}
                      height={350}
                      className="object-cover rounded-lg"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 md:pl-6 mt-4 md:mt-0">
                    <h2 className="text-xl font-kuhlenbach text-black">
                      {cartItem.name}
                    </h2>
                    <p className="text-gray-700 mt-2">
                      {/* Add product details here if available */}
                    </p>

                    {/* Quantity and Price */}
                    <div className="mt-4 flex items-center">
                      <div className="flex items-center border border-gray-300">
                        <button
                          className="px-3 py-1 text-black hover:bg-red-100"
                          onClick={() => decreaseQty(cartItem)}
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          className="w-12 h-10 text-center bg-white border-l border-r border-gray-300 text-black no-spin"
                          value={cartItem.quantity}
                          readOnly
                        />
                        <button
                          className="px-3 py-1 text-black hover:bg-red-100"
                          onClick={() => increaseQty(cartItem)}
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="ml-6">
                        <p className="text-lg font-semibold text-black">
                          {formatCurrency(
                            (cartItem.priceInCents * cartItem.quantity) / 100
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Remove Item */}
                  <div className="mt-4 md:mt-0 md:ml-6">
                    <button
                      className="text-gray-500 hover:text-black"
                      onClick={() => deleteItemFromCart(cartItem.productId)}
                    >
                      <TrashIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="mt-8">
                <Link href="/shop" className="text-red-600 hover:text-red-800">
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order Summary Section */}
            <aside className="w-full lg:w-1/3 mt-8 lg:mt-0">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-2xl font-kuhlenbach text-black mb-6">
                  Order Summary
                </h3>
                <ul className="space-y-4">
                  <li className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>{formatCurrency(amountWithoutTax)}</span>
                  </li>
                  <li className="flex justify-between text-gray-700">
                    <span>HST (13%)</span>
                    <span>${taxAmount}</span>
                  </li>
                  <li className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </li>
                  <li className="flex justify-between text-black font-semibold border-t border-gray-300 pt-4">
                    <span>Total</span>
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
