"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

// 1. Add itemCount to the interface here
interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  itemCount: number; 
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("aurelius_cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      const newCart = existing 
        ? prev.map(item => item.id === product.id ? {...item, quantity: item.quantity + 1} : item)
        : [...prev, { ...product, quantity: 1 }];
      localStorage.setItem("aurelius_cart", JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => {
      const newCart = prev.filter(item => item.id !== id);
      localStorage.setItem("aurelius_cart", JSON.stringify(newCart));
      return newCart;
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) => {
      const newCart = prev.map(item => item.id === id ? {...item, quantity} : item);
      localStorage.setItem("aurelius_cart", JSON.stringify(newCart));
      return newCart;
    });
  };

  // 2. Calculate the count
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    // 3. Pass it into the provider value
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};