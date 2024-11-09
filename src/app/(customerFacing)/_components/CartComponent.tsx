// src/app/_components/CartComponent.tsx

"use client";

import { createContext, useState, useEffect, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";

// Define types for cart items and the cart context
export interface CartItem {
  id: string;
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
  updateCartItem: (item: CartItem) => void;
  clearCart: () => void;
  incrementItemQuantity: (id: string) => void;
  decrementItemQuantity: (id: string) => void;
}

// Default cart context value
const defaultCartContext: CartContextType = {
  cart: { items: [] },
  addItemToCart: () => {},
  deleteItemFromCart: () => {},
  updateCartItem: () => {},
  clearCart: () => {},
  incrementItemQuantity: () => {},
  decrementItemQuantity: () => {},
};

// Create the context with a default value
const CartContext = createContext<CartContextType>(defaultCartContext);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart>({ items: [] });

  // Initialize cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Helper function to compare cart items
  function areItemsEqual(item1: CartItem, item2: CartItem) {
    return (
      item1.productId === item2.productId &&
      item1.cardMessage === item2.cardMessage &&
      item1.deliveryInstructions === item2.deliveryInstructions
    );
  }

  // Add item to cart or update quantity if it already exists
  const addItemToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.items.find((i) => areItemsEqual(i, item));

      let updatedItems;
      if (existingItem) {
        updatedItems = prevCart.items.map((i) =>
          areItemsEqual(i, item) ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        updatedItems = [...prevCart.items, { ...item }];
      }

      return { items: updatedItems };
    });
  };

  // Delete item from cart by id
  const deleteItemFromCart = (id: string) => {
    setCart((prevCart) => ({
      items: prevCart.items.filter((item) => item.id !== id),
    }));
  };

  // Update specific fields of a cart item
  const updateCartItem = (updatedItem: CartItem) => {
    setCart((prevCart) => ({
      items: prevCart.items.map((item) =>
        item.id === updatedItem.id ? { ...item, ...updatedItem } : item
      ),
    }));
  };

  // Increment item quantity by id
  const incrementItemQuantity = (id: string) => {
    setCart((prevCart) => ({
      items: prevCart.items.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      ),
    }));
  };

  // Decrement item quantity by id
  const decrementItemQuantity = (id: string) => {
    setCart((prevCart) => ({
      items: prevCart.items
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0),
    }));
  };

  // Clear the entire cart
  const clearCart = () => {
    setCart({ items: [] });
    localStorage.removeItem("cart");
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addItemToCart,
        deleteItemFromCart,
        updateCartItem,
        clearCart,
        incrementItemQuantity,
        decrementItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
