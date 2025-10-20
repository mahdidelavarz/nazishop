// /store/localCartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "../types/cartTypes";

interface LocalCartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clear: () => void;
}

export const useLocalCartStore = create<LocalCartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existing = get().items.find(
          (i) => i.product_id === item.product_id
        );
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.product_id === item.product_id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }
      },
      removeItem: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),
      clear: () => set({ items: [] }),
    }),
    { name: "guest-cart" }
  )
);
