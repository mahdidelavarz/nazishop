import { create } from "zustand";

export type SortOption = "newest" | "price-asc" | "price-desc" | "discount";
export type ViewMode = "grid" | "list";

interface ProductsFilterState {
  sortBy: SortOption;
  viewMode: ViewMode;
  priceRange: [number, number];
  selectedBrands: string[];
  showInStock: boolean;
  showWithDiscount: boolean;

  setSortBy: (sortBy: SortOption) => void;
  setViewMode: (viewMode: ViewMode) => void;
  setPriceRange: (range: [number, number]) => void;
  toggleBrand: (brand: string) => void;
  setShowInStock: (value: boolean) => void;
  setShowWithDiscount: (value: boolean) => void;
  clearFilters: () => void;
}

const initialState: Omit<
  ProductsFilterState,
  | "setSortBy"
  | "setViewMode"
  | "setPriceRange"
  | "toggleBrand"
  | "setShowInStock"
  | "setShowWithDiscount"
  | "clearFilters"
> = {
  sortBy: "newest",
  viewMode: "grid",
  priceRange: [0, 1_000_000_000],
  selectedBrands: [],
  showInStock: false,
  showWithDiscount: false,
};

export const useProductsStore = create<ProductsFilterState>((set) => ({
  ...initialState,

  setSortBy: (sortBy) => set({ sortBy }),
  setViewMode: (viewMode) => set({ viewMode }),
  setPriceRange: (range) => set({ priceRange: range }),
  toggleBrand: (brand) =>
    set((state) => ({
      selectedBrands: state.selectedBrands.includes(brand)
        ? state.selectedBrands.filter((b) => b !== brand)
        : [...state.selectedBrands, brand],
    })),
  setShowInStock: (value) => set({ showInStock: value }),
  setShowWithDiscount: (value) => set({ showWithDiscount: value }),
  clearFilters: () => set({ ...initialState }),
}));


