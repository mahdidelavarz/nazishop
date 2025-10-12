"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string;
  slug: string;
};

async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from("products").select("*");
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
    <div dir="rtl" className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">محصولات فروشگاه</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data?.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="border rounded-xl p-4 hover:shadow-lg transition flex flex-col"
          >
            <img
              src={product.thumbnail_url}
              alt={product.title}
              className="w-full h-48 object-cover rounded-md mb-3"
            />
            <h2 className="font-semibold text-lg">{product.title}</h2>
            <p className="text-gray-600 line-clamp-2 flex-1">{product.description}</p>
            <p className="font-bold text-pink-600 mt-2">
              {product.price.toLocaleString()} تومان
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
