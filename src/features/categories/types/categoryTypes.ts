// Category Types
// Based on categories table schema

export interface Category {
  id: string;
  name: string;
  image: string | null;
  icon: string | null;
  color: string | null;
  slug: string | null;
  sort_order: number | null;
}

export interface CategoryWithCount extends Category {
  count: number;
}

export interface CreateCategoryPayload {
  name: string;
  image?: string | null;
  icon?: string | null;
  color?: string | null;
  slug?: string | null;
  sort_order?: number | null;
}

export interface UpdateCategoryPayload {
  id: string;
  name?: string;
  image?: string | null;
  icon?: string | null;
  color?: string | null;
  slug?: string | null;
  sort_order?: number | null;
}

export interface CategoriesResponse {
  success: boolean;
  categories: CategoryWithCount[];
  message?: string;
}

export interface CategoryResponse {
  success: boolean;
  category: Category;
  message?: string;
}

