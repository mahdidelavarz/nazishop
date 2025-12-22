import { ProductListItem } from "@/features/products/types/productsType";

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product: ProductListItem & {
    description?: string | null;
  };
}

export interface WishlistResponse {
  success: boolean;
  items?: WishlistItem[];
  item?: WishlistItem;
  message?: string;
}

export interface AddToWishlistPayload {
  productId: string;
}
