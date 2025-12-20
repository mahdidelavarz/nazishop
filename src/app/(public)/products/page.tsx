// app/products/page.tsx
import { Metadata } from "next";
import { ProductsClient } from "@/features/products/components/ProductsClient";
import { ProductListItem } from "@/features/products/types/productsType";

export const metadata: Metadata = {
  title: "محصولات | گلامور شاپ",
  description: "مشاهده و خرید بهترین محصولات آرایشی و بهداشتی با بهترین قیمت و تحویل سریع",
  openGraph: {
    title: "محصولات | گلامور شاپ",
    description: "مشاهده و خرید بهترین محصولات آرایشی و بهداشتی",
    type: "website",
  },
};

export const revalidate = 60;

async function fetchProducts(): Promise<ProductListItem[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/products`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch products");
    }

    const data = await res.json();
    return data.products || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function ProductsPage() {
  const products = await fetchProducts();

  return <ProductsClient initialProducts={products} />;
}