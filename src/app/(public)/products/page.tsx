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
  try {
    // First, fetch products without nested query to avoid relationship issues
    const { data: productsData, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, title, description, price, original_price, thumbnail_url, slug, brand, stock")
      .order("created_at", { ascending: false });

    if (productsError || !productsData) {
      console.error("Fetch products error:", productsError);
      return <ProductsClient initialProducts={[]} />;
    }

    // Then, fetch product_details separately and merge
    const productIds = productsData.map(p => p.id);
    const { data: detailsData } = await supabaseAdmin
      .from("product_details")
      .select("product_id, images")
      .in("product_id", productIds);

    // Merge product_details with products
    const productsWithDetails = productsData.map(product => {
      const details = detailsData?.find(d => d.product_id === product.id);
      const mergedProduct = {
        ...product,
        details: details ? [{ images: details.images || [] }] : null,
      } as Product;
      
      // Debug logging
      if (details?.images && details.images.length > 0) {
        console.log(`Product ${product.title} has images:`, details.images);
      }
      
      return mergedProduct;
    });

    return <ProductsClient initialProducts={productsWithDetails} />;
  } catch (err) {
    console.error("Products page error:", err);
    return <ProductsClient initialProducts={[]} />;
  }
}