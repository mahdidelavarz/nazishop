import { apiClient } from "@/shared/lib/api-client";
import { WishlistResponse, AddToWishlistPayload } from "../types/wishlistTypes";

export const fetchWishlist = async (): Promise<WishlistResponse> => {
  const response = await apiClient.get<WishlistResponse>("/wishlist");
  return response.data;
};

export const addToWishlistApi = async (
  payload: AddToWishlistPayload
): Promise<WishlistResponse> => {
  const response = await apiClient.post<WishlistResponse>("/wishlist", payload);
  return response.data;
};

export const removeFromWishlistApi = async (
  productId: string
): Promise<WishlistResponse> => {
  const response = await apiClient.delete<WishlistResponse>(
    `/wishlist/${productId}`
  );
  return response.data;
};
