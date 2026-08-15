import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/lib/commerce";

const CART_STORAGE_KEY = "aboyejo-global-foods-cart-v1";

export type CartProduct = Pick<Product, "id" | "slug" | "name" | "size" | "image_url" | "price" | "sale_price" | "stock_status">;
export type CartItem = CartProduct & { quantity: number };

type CartContextValue = {
  items: CartItem[];
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  addItem: (product: CartProduct, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || "[]") as unknown;
    if (!Array.isArray(stored)) return [];
    return stored.flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const item = entry as Record<string, unknown>;
      if (typeof item.id !== "string" || typeof item.slug !== "string" || typeof item.name !== "string" || typeof item.size !== "string") return [];
      const quantity = Number(item.quantity);
      const price = Number(item.price);
      const salePrice = item.sale_price === null || item.sale_price === undefined ? null : Number(item.sale_price);
      if (!Number.isFinite(quantity) || quantity < 1 || !Number.isFinite(price) || (salePrice !== null && !Number.isFinite(salePrice))) return [];
      return [{
        id: item.id,
        slug: item.slug,
        name: item.name,
        size: item.size,
        image_url: typeof item.image_url === "string" ? item.image_url : null,
        price,
        sale_price: salePrice,
        stock_status: typeof item.stock_status === "string" ? item.stock_status : "available",
        quantity: Math.min(Math.floor(quantity), 100),
      }];
    });
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStoredCart);
  const [isCartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // The cart remains available for this session when local storage is unavailable.
    }
  }, [items]);

  const addItem = useCallback((product: CartProduct, quantity = 1) => {
    const safeQuantity = Math.max(1, Math.min(Math.floor(quantity), 100));
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (!existing) return [...current, { ...product, quantity: safeQuantity }];
      return current.map((item) => item.id === product.id ? { ...item, quantity: Math.min(item.quantity + safeQuantity, 100) } : item);
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const safeQuantity = Math.floor(quantity);
    setItems((current) => safeQuantity < 1
      ? current.filter((item) => item.id !== productId)
      : current.map((item) => item.id === productId ? { ...item, quantity: Math.min(safeQuantity, 100) } : item));
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((current) => current.filter((item) => item.id !== productId));
  }, []);

  const value = useMemo<CartContextValue>(() => ({
    items,
    cartCount: items.reduce((count, item) => count + item.quantity, 0),
    cartTotal: items.reduce((total, item) => total + (item.sale_price ?? item.price) * item.quantity, 0),
    isCartOpen,
    addItem,
    updateQuantity,
    removeItem,
    clearCart: () => setItems([]),
    openCart: () => setCartOpen(true),
    closeCart: () => setCartOpen(false),
  }), [addItem, isCartOpen, items, removeItem, updateQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
