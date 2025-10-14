export interface ProductDetail {
  description: string | null;
  specifications: Record<string, string> | null;
  images?: string[];
}

export interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  original_price?: number | null;
  stock: number;
  brand?: string | null;
  thumbnail_url?: string | null;
  slug: string;
  details?: ProductDetail[] | null;
}
