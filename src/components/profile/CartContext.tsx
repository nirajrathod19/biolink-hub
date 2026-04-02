import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  image_url: string | null;
  quantity: number;
  allow_cod: boolean;
  creator_id: string;
}

interface CartState {
  items: CartItem[];
  active_creator_id: string | null;
}

interface CartContextType {
  items: CartItem[];
  activeCreatorId: string | null;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  syncCreator: (creatorId: string) => void;
  totalItems: number;
  totalAmount: number;
  allAllowCod: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "brioo_cart";

const loadCart = (): CartState => {
  try {
    const saved = localStorage.getItem(CART_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.items)) return parsed;
      // migrate old format (plain array)
      if (Array.isArray(parsed)) return { items: parsed, active_creator_id: parsed[0]?.creator_id || null };
    }
  } catch {}
  return { items: [], active_creator_id: null };
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<CartState>(loadCart);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(state));
  }, [state]);

  const syncCreator = (creatorId: string) => {
    setState((prev) => {
      if (prev.active_creator_id === creatorId) return prev;
      // Different creator — clear cart
      return { items: [], active_creator_id: creatorId };
    });
  };

  const addItem = (item: Omit<CartItem, "quantity">) => {
    setState((prev) => {
      // If cart belongs to a different creator, reset
      if (prev.active_creator_id && prev.active_creator_id !== item.creator_id) {
        return { active_creator_id: item.creator_id, items: [{ ...item, quantity: 1 }] };
      }
      const existing = prev.items.find((i) => i.id === item.id);
      const newItems = existing
        ? prev.items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...prev.items, { ...item, quantity: 1 }];
      return { active_creator_id: item.creator_id, items: newItems };
    });
  };

  const removeItem = (id: string) => setState((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== id) }));

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) return removeItem(id);
    setState((prev) => ({ ...prev, items: prev.items.map((i) => (i.id === id ? { ...i, quantity: qty } : i)) }));
  };

  const clearCart = () => setState((prev) => ({ ...prev, items: [] }));

  const { items } = state;
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalAmount = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const allAllowCod = items.length > 0 && items.every((i) => i.allow_cod);

  return (
    <CartContext.Provider value={{ items, activeCreatorId: state.active_creator_id, addItem, removeItem, updateQuantity, clearCart, syncCreator, totalItems, totalAmount, allAllowCod }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};