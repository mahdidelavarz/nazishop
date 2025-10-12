"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

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
          stock,
          details:product_details(description, specifications)
        `)
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p>در حال بارگذاری...</p>;
  if (error || !product) return <p>محصول یافت نشد.</p>;

  return (
    <div dir="rtl" className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mt-4">{product.title}</h1>
      <p className="text-gray-700 mt-2">{product.description}</p>
      <p className="text-lg font-semibold mt-4">💰 {product.price} تومان</p>
      <p className="text-sm text-gray-500">موجودی: {product.stock}</p>

      {product.details && product.details.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">جزئیات محصول</h2>
          <p className="mt-2">{product.details[0]?.description}</p>
          {product.details[0]?.specifications && (
            <pre className="bg-gray-100 p-3 rounded-md mt-3 text-sm">
              {JSON.stringify(product.details[0].specifications, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}





// [score , discountPercent , name , brandDetail , image]
// [specifications , image , information {title , description} , totalCount , showCount , isEmasing , emazingEndsAt ]