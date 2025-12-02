// app/products/page.tsx
import ProductsClient from "@/features/products/components/ClientProductWrapper";
import { supabaseAdmin } from "@/shared/lib/supabase/supabase";
import { Product } from "@/features/products/types/productsType";

export const revalidate = 60; // ISR: re-generate page every 60 seconds

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