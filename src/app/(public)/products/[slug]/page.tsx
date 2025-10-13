"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

type ProductDetail = {
  description: string | null;
  specifications: Record<string, string> | null;
  images?: string[];
};

type Product = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  original_price?: number | null;
  stock: number;
  brand?: string | null;
  thumbnail_url?: string | null;
  details?: ProductDetail[] | null;
};

export default function SingleProductPage() {
  const { slug } = useParams();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          title,
          description,
          price,
          original_price,
          brand,
          stock,
          thumbnail_url,
          details:product_details(description, specifications, images)
        `)
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data as Product;
    },
  });

  if (isLoading)
    return <p className="text-center py-10 text-gray-500">در حال بارگذاری محصول...</p>;
  if (error || !product) return <p className="text-center py-10 text-red-500">محصول یافت نشد.</p>;

  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(
          ((product.original_price - product.price) / product.original_price) * 100
        )
      : 0;

  // const firstImage =
  //   product.details?.[0]?.images?.[0] || product.thumbnail_url || `/${product.thumbnail_url}` || "/no-image.jpg";

  return (
    <div dir="rtl" className="max-w-6xl mx-auto p-6">
      {/* layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-sm p-6">
        {/* image gallery */}
        <div className="flex flex-col gap-3">
          <img
             src={`/${product.thumbnail_url}`}
            alt={product.title}
            className="w-full aspect-square object-cover rounded-lg border"
          />
          <div className="flex gap-2 overflow-x-auto pb-2">
            {product.details?.[0]?.images?.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`تصویر ${i + 1}`}
                className="w-20 h-20 object-cover rounded-md border hover:opacity-80 cursor-pointer"
              />
            ))}
          </div>
        </div>

        {/* product info */}
        <div className="flex flex-col justify-between">
          <div>
            {product.brand && (
              <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
            )}
            <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>

            <p className="mt-3 text-gray-700 leading-relaxed">{product.description}</p>

            {/* pricing */}
            <div className="mt-6">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-pink-600">
                  {product.price.toLocaleString()} تومان
                </span>
                {product.original_price && (
                  <span className="text-gray-400 line-through text-sm">
                    {product.original_price.toLocaleString()}
                  </span>
                )}
                {discount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                    %{discount} تخفیف
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                موجودی: {product.stock > 0 ? `${product.stock} عدد` : "ناموجود"}
              </p>
            </div>
          </div>

          <button
            disabled={product.stock <= 0}
            className={`mt-6 w-full py-3 rounded-lg font-bold text-white ${
              product.stock > 0
                ? "bg-pink-600 hover:bg-pink-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            افزودن به سبد خرید
          </button>
        </div>
      </div>

      {/* product details section */}
      {product.details?.[0] && (
        <div className="mt-10 bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">جزئیات محصول</h2>
          {product.details[0].description && (
            <p className="text-gray-700 leading-relaxed mb-4">
              {product.details[0].description}
            </p>
          )}

          {product.details[0].specifications && (
            <table className="w-full text-sm border-t border-gray-200">
              <tbody>
                {Object.entries(product.details[0].specifications).map(([key, value]) => (
                  <tr key={key} className="border-b">
                    <td className="py-2 text-gray-500 w-1/3">{key}</td>
                    <td className="py-2 text-gray-800">{value as string}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
