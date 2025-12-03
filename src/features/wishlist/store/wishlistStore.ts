import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistStore {
  wishlistIds: Set<string>;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  setWishlistIds: (ids: string[]) => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      wishlistIds: new Set<string>(),

      addToWishlist: (productId: string) => {
        set((state) => ({
          wishlistIds: new Set(state.wishlistIds).add(productId),
        }));
      },

      removeFromWishlist: (productId: string) => {
        set((state) => {
          const newSet = new Set(state.wishlistIds);
          newSet.delete(productId);
          return { wishlistIds: newSet };
        });
      },

      isInWishlist: (productId: string) => {
        return get().wishlistIds.has(productId);
      },

      clearWishlist: () => {
        set({ wishlistIds: new Set() });
      },

      setWishlistIds: (ids: string[]) => {
        set({ wishlistIds: new Set(ids) });
      },
    }),
    {
      name: "wishlist-storage",
      // Custom serialization for Set
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str);
          return {
            state: {
              ...state,
              wishlistIds: new Set(state.wishlistIds || []),
            },
          };
        },
        setItem: (name, value) => {
          const str = JSON.stringify({
            state: {
              ...value.state,
              wishlistIds: Array.from(value.state.wishlistIds),
            },
          });
          localStorage.setItem(name, str);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);