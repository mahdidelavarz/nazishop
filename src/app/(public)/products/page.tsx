"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  original_price?: number;
  thumbnail_url: string;
  slug: string;
  brand?: string;
};

async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id, title, description, price, original_price, thumbnail_url, slug, brand")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export default function ProductsPage() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  if (isLoading)
    return <p className="text-center py-10 text-gray-500">در حال بارگذاری محصولات...</p>;

  if (error)
    return <p className="text-center py-10 text-red-500">خطا در بارگذاری محصولات</p>;

  return (
    <div dir="rtl" className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-8 text-gray-800 border-b pb-2">
        محصولات فروشگاه
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5">
        {data?.map((product) => {
          const discount =
            product.original_price && product.original_price > product.price
              ? Math.round(
                  ((product.original_price - product.price) / product.original_price) * 100
                )
              : 0;

          return (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="relative border rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-lg transition duration-200 flex flex-col group"
            >
              {/* discount badge */}
              {discount > 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                  %{discount} تخفیف
                </div>
              )}

              {/* image */}
              <div className="relative w-full aspect-[1/1.2] overflow-hidden">
                <img
                  src={product.thumbnail_url}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* content */}
              <div className="flex flex-col p-3 flex-1">
                {product.brand && (
                  <span className="text-xs text-gray-500 mb-1">{product.brand}</span>
                )}
                <h2 className="font-semibold text-sm text-gray-800 line-clamp-2 mb-1">
                  {product.title}
                </h2>

                <p className="text-xs text-gray-500 line-clamp-2 flex-1">
                  {product.description}
                </p>

                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-pink-600 text-sm">
                      {product.price.toLocaleString()} تومان
                    </span>
                    {discount > 0 && (
                      <span className="text-xs text-gray-400 line-through">
                        {product.original_price?.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
