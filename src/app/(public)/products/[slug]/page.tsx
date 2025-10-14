import AddToCartButton from "@/features/products/components/AddToCartBtn";
import { fetchSingleProductApi } from "@/features/products/services/productsService";
import { Product } from "@/features/products/types/productsType";


export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product: Product = await fetchSingleProductApi(params.slug);
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

export default async function SingleProductPage({ params }: { params: { slug: string } }) {
  const product: Product = await fetchSingleProductApi(params.slug);
  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(
          ((product.original_price - product.price) / product.original_price) * 100
        )
      : 0;

  return (
    <div dir="rtl" className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-sm p-6">
        {/* images */}
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

          {/* client component for interactivity */}
          <AddToCartButton productId={product.id} stock={product.stock} />
        </div>
      </div>

      {/* details */}
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
                    <td className="py-2 text-gray-800">{value}</td>
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
