// app/products/page.tsx
import ProductsClient from "@/features/products/components/ClientProductWrapper";

import { Product } from "@/features/products/types/productsType";
import { supabaseAdmin } from "@/shared/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "محصولات | گلامور شاپ",
  description: "مشاهده و خرید بهترین محصولات آرایشی و بهداشتی با بهترین قیمت و تحویل سریع",
};

export const revalidate = 60; // ISR: re-generate page every 60 seconds
export const dynamic = 'force-static';

export default async function ProductsPage() {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("id, title, description, price, original_price, thumbnail_url, slug, brand, stock")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch products error:", error);
  }

  return <ProductsClient initialProducts={(data as Product[]) || []} />;
}