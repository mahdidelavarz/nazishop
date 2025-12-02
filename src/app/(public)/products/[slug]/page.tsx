// app/products/[slug]/page.tsx
import AddToCartButton from "@/features/products/components/AddToCartBtn";
import { Product } from "@/features/products/types/productsType";
import { supabaseAdmin } from "@/shared/lib/supabase/supabase";
import { Icon } from "@iconify/react";
import Link from "next/link";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = await supabaseAdmin
    .from("products")
    .select(
      "id, title, description, price, original_price, brand, stock, thumbnail_url, slug"
    )
    .eq("slug", slug)
    .single();
  const product = data as Product;
  return {
    title: `${product.title} | فروشگاه آرایشی`,
    description: product.description || "خرید بهترین محصولات آرایشی",
    openGraph: {
      title: product.title,
      description: product.description,
      images: product.thumbnail_url ? [{ url: product.thumbnail_url }] : [],
    },
  };
}

export default async function SingleProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await supabaseAdmin
    .from("products")
    .select(
      `
      id,
      title,
      description,
      price,
      original_price,
      brand,
      stock,
      thumbnail_url,
      slug,
      details:product_details(description, specifications, images)
    `
    )
    .eq("slug", slug)
    .single();

  if (error || !data) {
    throw new Error("محصول یافت نشد");
  }

  const product = data as Product;
  
  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(
          ((product.original_price - product.price) / product.original_price) * 100
        )
      : 0;

  const isOutOfStock = product.stock === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-pink-500 transition">خانه</Link>
            <Icon icon="ph:caret-left" width={16} />
            <Link href="/products" className="hover:text-pink-500 transition">محصولات</Link>
            <Icon icon="ph:caret-left" width={16} />
            <span className="text-gray-800 font-medium truncate max-w-xs">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Image Gallery */}
          <div className="p-6 lg:p-8">
            <div className="relative mb-4">
              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {discount > 0 && (
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                    <Icon icon="ph:percent-duotone" width={18} />
                    {discount}% تخفیف
                  </div>
                )}
                {isOutOfStock && (
                  <div className="bg-gray-800 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                    ناموجود
                  </div>
                )}
              </div>

              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                {product.thumbnail_url ? (
                  <img
                    src={product.thumbnail_url.startsWith('/') ? product.thumbnail_url : `/${product.thumbnail_url}`}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon icon="ph:image-duotone" className="text-gray-300" width={64} />
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {product.details?.[0]?.images && product.details[0].images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.details[0].images.map((img, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-pink-500 cursor-pointer transition"
                  >
                    <img
                      src={img}
                      alt={`تصویر ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-6 lg:p-8 flex flex-col">
            {/* Brand */}
            {product.brand && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Icon icon="ph:tag-duotone" width={18} />
                <span>{product.brand}</span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {product.title}
            </h1>

            {/* Description */}
            {product.description && (
              <p className="text-gray-700 leading-relaxed mb-6">
                {product.description}
              </p>
            )}

            {/* Price Section */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 mb-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-extrabold text-pink-600">
                  {product.price.toLocaleString()}
                </span>
                <span className="text-lg text-gray-700">تومان</span>
              </div>
              
              {product.original_price && discount > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 line-through text-lg">
                    {product.original_price.toLocaleString()} تومان
                  </span>
                  <span className="text-green-600 font-semibold">
                    {(product.original_price - product.price).toLocaleString()} تومان تخفیف
                  </span>
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-6 pb-6 border-b">
              {isOutOfStock ? (
                <div className="flex items-center gap-2 text-red-600">
                  <Icon icon="ph:x-circle-duotone" width={24} />
                  <span className="font-medium">ناموجود</span>
                </div>
              ) : product.stock < 10 ? (
                <div className="flex items-center gap-2 text-orange-600">
                  <Icon icon="ph:warning-duotone" width={24} />
                  <span className="font-medium">تنها {product.stock} عدد در انبار باقی مانده</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-600">
                  <Icon icon="ph:check-circle-duotone" width={24} />
                  <span className="font-medium">موجود در انبار</span>
                </div>
              )}
            </div>

            {/* Add to Cart Component */}
            <div className="mt-auto">
              <AddToCartButton product={product} stock={product.stock} />
            </div>

            {/* Additional Features */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <Icon icon="ph:truck-duotone" className="text-pink-500 mx-auto mb-2" width={32} />
                <p className="text-xs text-gray-600">ارسال سریع</p>
              </div>
              <div className="text-center">
                <Icon icon="ph:shield-check-duotone" className="text-green-500 mx-auto mb-2" width={32} />
                <p className="text-xs text-gray-600">ضمانت اصالت</p>
              </div>
              <div className="text-center">
                <Icon icon="ph:arrow-counter-clockwise-duotone" className="text-blue-500 mx-auto mb-2" width={32} />
                <p className="text-xs text-gray-600">۷ روز ضمانت</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details & Specifications */}
        {product.details?.[0] && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="border-b">
              <div className="flex">
                <button className="px-6 py-4 font-bold text-pink-600 border-b-2 border-pink-600">
                  جزئیات محصول
                </button>
              </div>
            </div>

            <div className="p-6 lg:p-8">
              {/* Full Description */}
              {product.details[0].description && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Icon icon="ph:info-duotone" width={24} className="text-pink-500" />
                    توضیحات کامل
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {product.details[0].description}
                  </p>
                </div>
              )}

              {/* Specifications Table */}
              {product.details[0].specifications && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Icon icon="ph:list-checks-duotone" width={24} className="text-purple-500" />
                    مشخصات فنی
                  </h3>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <tbody>
                        {Object.entries(product.details[0].specifications).map(([key, value], index) => (
                          <tr
                            key={key}
                            className={`${
                              index % 2 === 0 ? "bg-gray-50" : "bg-white"
                            } hover:bg-pink-50 transition`}
                          >
                            <td className="py-4 px-6 text-gray-700 font-medium w-1/3">
                              {key}
                            </td>
                            <td className="py-4 px-6 text-gray-900">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}