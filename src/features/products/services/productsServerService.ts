import { ProductListItem, SingleProduct } from "../types/productsType";

/**
 * Server-side product fetching service
 * Used in Server Components for SSR/ISR and metadata generation
 */

const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};

/**
 * Fetch all products (server-side)
 */
export async function fetchProductsServer(): Promise<ProductListItem[]> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/products`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error("Failed to fetch products:", res.status);
      return [];
    }

    const data = await res.json();
    return data.products || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

/**
 * Fetch single product by slug (server-side)
 */
export async function fetchProductBySlugServer(
  slug: string
): Promise<SingleProduct | null> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/products/${slug}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.product || null;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

