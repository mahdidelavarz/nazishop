// Admin Product Types
// Based on products table schema

export interface AdminProduct {
  id: string;
  title: string;
  description: string | null;
  price: number;
  original_price: number | null;
  discount_percent: number | null; // Computed field
  stock: number;
  slug: string;
  code: number; // Auto-generated identity
  brand: string | null;
  currency: string; // Default: 'IRT'
  sku: string | null;
  rating: number; // 0-5
  reviews_count: number;
  tags: string[] | null;
  thumbnail_url: string | null;
  category_id: string | null;
  is_public: boolean;
  created_at: string;
}

export interface AdminProductListItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  original_price: number | null;
  discount_percent: number | null;
  stock: number;
  brand: string | null;
  thumbnail_url: string | null;
  is_public: boolean;
  sku: string | null;
  category_id: string | null;
}

export interface AdminProductDetails {
  product_id: string;
  description: string | null;
  specifications: Record<string, unknown> | null;
  images: string[] | null;
  extra_info: Record<string, unknown> | null;
  weight: number | null;
  dimensions: Record<string, unknown> | null;
  video_url: string | null;
}

export interface CreateProductPayload {
  title: string;
  slug: string;
  price: number;
  stock: number;
  description?: string | null;
  original_price?: number | null;
  brand?: string | null;
  thumbnail_url?: string | null;
  sku?: string | null;
  tags?: string[] | null;
  category_id?: string | null;
  is_public?: boolean;
  currency?: string;
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  id: string;
}

export interface CreateProductDetailsPayload {
  product_id: string;
  description?: string | null;
  specifications?: Record<string, unknown> | null;
  images?: string[] | null;
  extra_info?: Record<string, unknown> | null;
  weight?: number | null;
  dimensions?: Record<string, unknown> | null;
  video_url?: string | null;
}

export interface UpdateProductDetailsPayload extends Partial<Omit<CreateProductDetailsPayload, 'product_id'>> {
  product_id: string;
}

// Form types
export interface ProductFormData {
  title: string;
  slug: string;
  price: number;
  original_price: number | null;
  stock: number;
  brand: string | null;
  description: string | null;
  thumbnail_url: string | null;
  sku: string | null;
  tags: string[];
  category_id: string | null;
  is_public: boolean;
  images?: FileList;
}

// Upload types
export interface UploadResponse {
  success: boolean;
  urls?: string[];
  message?: string;
  details?: string;
}

// API Response types
export interface AdminProductsResponse {
  success: boolean;
  products: AdminProductListItem[];
  message?: string;
}

export interface AdminProductResponse {
  success: boolean;
  product: AdminProduct;
  message?: string;
}

export interface AdminProductDetailsResponse {
  success: boolean;
  details: AdminProductDetails | null;
  message?: string;
}

