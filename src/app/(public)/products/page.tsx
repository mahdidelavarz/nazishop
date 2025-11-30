// app/products/page.tsx
import ProductsClient from "@/features/products/components/ClientProductWrapper";
import { fetchProductsApi } from "@/features/products/services/productsService";

export const revalidate = 60; // ISR: re-generate page every 60 seconds

export default async function ProductsPage() {
  const products = await fetchProductsApi();
  return <ProductsClient initialProducts={products} />;
}