"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { MenuItem } from "@/lib/menu/types";

export type CartLine = {
  menuItemId: string;
  name: string;
  priceCents: number;
  emoji: string;
  quantity: number;
};

export const MAX_QUANTITY = 20;

type CartContextValue = {
  lines: CartLine[];
  /** False until localStorage has been read — render cart counts only after this. */
  hydrated: boolean;
  addItem: (item: MenuItem) => void;
  removeItem: (menuItemId: string) => void;
  setQuantity: (menuItemId: string, quantity: number) => void;
  clear: () => void;
  totalCents: number;
  count: number;
};

const STORAGE_KEY = "kopi-cart-v1";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load once on mount. localStorage must be read AFTER hydration (a lazy
  // useState initializer would make the first client render differ from the
  // server HTML), so this one-time synchronous set is intentional.
  useEffect(() => {
    let saved: CartLine[] = [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) saved = parsed;
      }
    } catch {
      // Corrupt or blocked storage — start with an empty cart.
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLines(saved);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Storage full or blocked — the cart still works for this session.
    }
  }, [lines, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const addItem = (item: MenuItem) =>
      setLines((prev) => {
        const existing = prev.find((l) => l.menuItemId === item.id);
        if (existing) {
          return prev.map((l) =>
            l.menuItemId === item.id
              ? { ...l, quantity: Math.min(l.quantity + 1, MAX_QUANTITY) }
              : l
          );
        }
        return [
          ...prev,
          {
            menuItemId: item.id,
            name: item.name,
            priceCents: item.price_cents,
            emoji: item.emoji,
            quantity: 1,
          },
        ];
      });

    const removeItem = (menuItemId: string) =>
      setLines((prev) => prev.filter((l) => l.menuItemId !== menuItemId));

    const setQuantity = (menuItemId: string, quantity: number) =>
      setLines((prev) =>
        quantity < 1
          ? prev.filter((l) => l.menuItemId !== menuItemId)
          : prev.map((l) =>
              l.menuItemId === menuItemId
                ? { ...l, quantity: Math.min(quantity, MAX_QUANTITY) }
                : l
            )
      );

    const clear = () => setLines([]);

    const totalCents = lines.reduce((sum, l) => sum + l.priceCents * l.quantity, 0);
    const count = lines.reduce((sum, l) => sum + l.quantity, 0);

    return { lines, hydrated, addItem, removeItem, setQuantity, clear, totalCents, count };
  }, [lines, hydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
