// features/products/components/ProductDetails.tsx
"use client";

import { ProductDetails as ProductDetailsType } from "@/features/products/types/productsType";
import { Icon } from "@iconify/react";

interface ProductDetailsProps {
  details: ProductDetailsType;
}

export function ProductDetails({ details }: ProductDetailsProps) {
  const hasDescription = details.description;
  const hasSpecifications =
    details.specifications && Object.keys(details.specifications).length > 0;

  if (!hasDescription && !hasSpecifications) {
    return null;
  }

  return (
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
        {hasDescription && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Icon
                icon="ph:info-duotone"
                width={24}
                className="text-pink-500"
              />
              توضیحات کامل
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {details.description}
            </p>
          </div>
        )}

        {/* Specifications Table */}
        {hasSpecifications && (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Icon
                icon="ph:list-checks-duotone"
                width={24}
                className="text-purple-500"
              />
              مشخصات فنی
            </h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <tbody>
                  {details.specifications && Object.entries(details.specifications).map(
                    ([key, value], index) => (
                      <tr
                        key={key}
                        className={`${
                          index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        } hover:bg-pink-50 transition`}
                      >
                        <td className="py-4 px-6 text-gray-700 font-medium w-1/3">
                          {key}
                        </td>
                        <td className="py-4 px-6 text-gray-900">
                          {String(value)}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}