import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { toast } from "sonner";

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
  addItem: (item: Omit<CartItem, "quantity">) => boolean;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  allAllowCod: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "brioo_cart";

const isCartItem = (value: unknown): value is CartItem => {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<CartItem>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.price === "number" &&
    typeof item.currency === "string" &&
    typeof item.quantity === "number" &&
    typeof item.allow_cod === "boolean" &&
    typeof item.creator_id === "string"
  );
};

const buildCartState = (items: CartItem[], preferredCreatorId?: string | null): CartState => {
  const creatorIds = Array.from(new Set(items.map((item) => item.creator_id).filter(Boolean)));

  if (creatorIds.length === 0) {
    return { items: [], active_creator_id: null };
  }

  const activeCreatorId =
    creatorIds.length === 1
      ? creatorIds[0]
      : preferredCreatorId && creatorIds.includes(preferredCreatorId)
        ? preferredCreatorId
        : creatorIds[0];

  return {
    items: items.filter((item) => item.creator_id === activeCreatorId),
    active_creator_id: activeCreatorId,
  };
};

const loadCart = (): CartState => {
  try {
    const saved = localStorage.getItem(CART_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return buildCartState(parsed.filter(isCartItem));
      }

      if (parsed && typeof parsed === "object" && Array.isArray(parsed.items)) {
        const preferredCreatorId = typeof parsed.active_creator_id === "string" ? parsed.active_creator_id : null;
        return buildCartState(parsed.items.filter(isCartItem), preferredCreatorId);
      }
    }
  } catch {}

  return { items: [], active_creator_id: null };
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<CartState>(loadCart);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
    localStorage.setItem(CART_KEY, JSON.stringify(state));
  }, [state]);

  const addItem = (item: Omit<CartItem, "quantity">) => {
    const currentState = stateRef.current;
    const cartCreatorId = currentState.active_creator_id ?? currentState.items[0]?.creator_id ?? null;

    if (cartCreatorId && cartCreatorId !== item.creator_id) {
      toast.error("You can only add items from one store at a time. Please clear your current cart first.");
      return false;
    }

    setState((prev) => {
      const existing = prev.items.find((cartItem) => cartItem.id === item.id);
      const items = existing
        ? prev.items.map((cartItem) =>
            cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
          )
        : [...prev.items, { ...item, quantity: 1 }];

      return buildCartState(items, prev.active_creator_id ?? prev.items[0]?.creator_id ?? item.creator_id);
    });

    // Pro micro-feedback — minimalist toast
    toast.success(item.title, { description: "Added to cart", duration: 1800 });
    return true;
  };

  const removeItem = (id: string) =>
    setState((prev) => buildCartState(prev.items.filter((item) => item.id !== id), prev.active_creator_id));

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) return removeItem(id);

    setState((prev) =>
      buildCartState(
        prev.items.map((item) => (item.id === id ? { ...item, quantity: qty } : item)),
        prev.active_creator_id
      )
    );
  };

  const clearCart = () => setState({ items: [], active_creator_id: null });

  const { items } = state;
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalAmount = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const allAllowCod = items.length > 0 && items.every((i) => i.allow_cod);

  return (
    <CartContext.Provider
      value={{
        items,
        activeCreatorId: state.active_creator_id,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
        allAllowCod,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};