import { create } from "zustand";
import type { CartItem, MenuOption } from "../types/models";

type CartState = {
  storeId: number | null;
  items: CartItem[];
  addItem: (item: Omit<CartItem, "key">) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  totalPrice: () => number;
  totalCount: () => number;
};

function itemKey(
  menuId: string,
  size: string,
  options: MenuOption[],
  storeId: number
) {
  const opt = options
    .map((o) => o.id)
    .sort()
    .join(",");
  return `${storeId}:${menuId}:${size}:${opt}`;
}

export const useCartStore = create<CartState>((set, get) => ({
  storeId: null,
  items: [],
  addItem: (item) => {
    const key = itemKey(item.menuId, item.size, item.options, item.storeId);
    const current = get().items;
    if (get().storeId && get().storeId !== item.storeId) {
      set({
        storeId: item.storeId,
        items: [{ ...item, key }],
      });
      return;
    }
    const existing = current.find((i) => i.key === key);
    if (existing) {
      set({
        storeId: item.storeId,
        items: current.map((i) =>
          i.key === key ? { ...i, quantity: i.quantity + item.quantity } : i
        ),
      });
      return;
    }
    set({
      storeId: item.storeId,
      items: [...current, { ...item, key }],
    });
  },
  removeItem: (key) => {
    const items = get().items.filter((i) => i.key !== key);
    set({ items, storeId: items[0]?.storeId ?? null });
  },
  clear: () => set({ items: [], storeId: null }),
  totalPrice: () =>
    get().items.reduce((sum, item) => {
      const opt = item.options.reduce((s, o) => s + o.price, 0);
      return sum + (item.unitPrice + opt) * item.quantity;
    }, 0),
  totalCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
