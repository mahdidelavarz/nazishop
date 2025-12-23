// Brand Types
// Based on brands table schema

export interface Brand {
  id: string;
  name: string;
  logo: string | null;
  slug: string | null;
  sort_order: number | null;
  created_at?: string;
}

export interface BrandWithCount extends Brand {
  count: number;
}

export interface CreateBrandPayload {
  name: string;
  logo?: string | null;
  slug?: string | null;
  sort_order?: number | null;
}

export interface UpdateBrandPayload {
  id: string;
  name?: string;
  logo?: string | null;
  slug?: string | null;
  sort_order?: number | null;
}

export interface BrandsResponse {
  success: boolean;
  brands: BrandWithCount[];
  message?: string;
}

export interface BrandResponse {
  success: boolean;
  brand: Brand;
  message?: string;
}

