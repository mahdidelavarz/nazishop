export interface CartItemPayload {
  productId: string;
  quantity: number;
}
export interface CartProduct {
  id: string;
  title: string;
  price: number;
  thumbnail_url?: string | null;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  products?: CartProduct; // join from products table
}
export interface CartItemRow {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
}