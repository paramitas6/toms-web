"use client";

import { createContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

// Define types for cart items and the cart context
export interface CartItem {
  productId: string;
  name: string;
  priceInCents: number;
  image: string;
  quantity: number;
  deliveryInstructions?: string;
  cardMessage?: string;
}

interface Cart {
  items: CartItem[];
}

// Define the types for the context
interface CartContextType {
  cart: Cart;
  addItemToCart: (item: CartItem) => void;
  deleteItemFromCart: (id: string) => void;
  clearCart: () => void; // Added clearCart
}

// Default cart context value
const defaultCartContext: CartContextType = {
  cart: { items: [] },
  addItemToCart: () => {},
  deleteItemFromCart: () => {},
  clearCart: () => {}, // Added clearCart
};

// Create the context with a default value
const CartContext = createContext<CartContextType>(defaultCartContext);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart>({ items: [] });
  const router = useRouter();

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  const saveCartToLocalStorage = (newCart: Cart) => {
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const addItemToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.items.find(
        (i) => i.productId === item.productId
      );

      let updatedItems;
      if (existingItem) {
        updatedItems = prevCart.items.map((i) =>
          i.productId === item.productId ? { ...i, quantity: item.quantity } : i
        );
      } else {
        updatedItems = [...prevCart.items, item];
      }

      const updatedCart = { items: updatedItems };
      saveCartToLocalStorage(updatedCart);
      return updatedCart;
    });
  };

  const deleteItemFromCart = (id: string) => {
    setCart((prevCart) => {
      const updatedItems = prevCart.items.filter((item) => item.productId !== id);
      const updatedCart = { items: updatedItems };
      saveCartToLocalStorage(updatedCart);
      return updatedCart;
    });
  };

  // Added clearCart function
  const clearCart = () => {
    setCart({ items: [] });
    localStorage.removeItem("cart");
  };

  return (
    <CartContext.Provider
      value={{ cart, addItemToCart, deleteItemFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
