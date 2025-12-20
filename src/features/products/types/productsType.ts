export interface ProductDetails {
  description: string | null;
  specifications: Record<string, any> | null;
  images: string[] | null;
  extra_info?: Record<string, any> | null;
  weight?: number | null;
  dimensions?: Record<string, any> | null;
  video_url?: string | null;
}

export interface ProductListItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  original_price: number | null;
  discount_percent: number | null;
  thumbnail_url: string | null;
  brand: string | null;
  stock: number;
  rating: number;
  reviews_count: number;
}

export interface SingleProduct {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  price: number;
  original_price: number | null;
  discount_percent: number | null;
  brand: string | null;
  stock: number;
  thumbnail_url: string | null;
  rating: number;
  reviews_count: number;
  product_details: ProductDetails | null;
}

export interface CreateProductType {
  title: string;
  slug: string;
  price: number;
  stock: number;
  description?: string | null;
  original_price?: number | null;
  brand?: string | null;
  thumbnail_url?: string | null;
  images?: string[];
}

export interface UpdateProductType extends Partial<CreateProductType> {
  id: string;
}
