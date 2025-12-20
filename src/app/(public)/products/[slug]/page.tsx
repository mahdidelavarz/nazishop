// app/products/[slug]/page.tsx
import { Metadata } from "next";

import { SingleProduct } from "@/features/products/types/productsType";
import { notFound } from "next/navigation";
import { SingleProductClient } from "@/features/products/components/SingleProductClient";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function fetchProduct(slug: string): Promise<SingleProduct | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/products/${slug}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.product || null;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  if (!product) {
    return {
      title: "محصول یافت نشد",
    };
  }

  return {
    title: `${product.title} | فروشگاه آرایشی`,
    description: product.description || "خرید بهترین محصولات آرایشی",
    openGraph: {
      title: product.title,
      description: product.description || undefined,
      images: product.thumbnail_url ? [{ url: product.thumbnail_url }] : [],
    },
  };
}

export default async function SingleProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  if (!product) {
    notFound();
  }

  return <SingleProductClient product={product} />;
}
