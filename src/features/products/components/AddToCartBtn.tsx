"use client";

import { useAddToCart } from "@/features/cart/hooks/useCart";
import { useLocalCartStore } from "@/features/cart/store/localCartStore";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useState } from "react";
import { Product } from "../types/productsType";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface AddToCartButtonProps {
  product: Product;
  stock: number;
}

export default function AddToCartButton({ product, stock }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const { isAuthenticated } = useAuthStore();
  const { mutate: addToCart, isPending } = useAddToCart();
  const addToLocalCart = useLocalCartStore((state) => state.addItem);
  const router = useRouter();

  const isOutOfStock = stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error("این محصول موجود نیست");
      return;
    }

    if (isAuthenticated) {
      // Add to database cart
      addToCart({ 
        productId: product.id, 
        quantity 
      });
    } else {
      // Add to local storage cart
      addToLocalCart({
        id: `temp-${product.id}`,
        product_id: product.id,
        quantity,
        products: {
          id: product.id,
          title: product.title,
          price: product.price,
          thumbnail_url: product.thumbnail_url,
        },
      });
      toast.success("محصول به سبد خرید اضافه شد");
      
      // Show login prompt
      setTimeout(() => {
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <Icon icon="ph:info-duotone" className="text-blue-500" width={24} />
                <div className="mr-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    برای تکمیل خرید وارد شوید
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    سبد خرید شما ذخیره شد. بعد از ورود می‌توانید خرید را تکمیل کنید.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-r border-gray-200">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  router.push('/login?redirectedFrom=/cart');
                }}
                className="w-full border border-transparent rounded-none rounded-l-lg p-4 flex items-center justify-center text-sm font-medium text-pink-600 hover:text-pink-500"
              >
                ورود
              </button>
            </div>
          </div>
        ), { duration: 5000 });
      }, 500);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">تعداد:</span>
        <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon icon="ph:minus-bold" width={20} />
          </button>
          
          <span className="w-12 text-center font-bold text-lg">{quantity}</span>
          
          <button
            onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
            disabled={quantity >= stock || isOutOfStock}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon icon="ph:plus-bold" width={20} />
          </button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        disabled={isPending || isOutOfStock}
        onClick={handleAddToCart}
        className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] ${
          isOutOfStock
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-pink-500 to-purple-500 hover:shadow-lg"
        }`}
      >
        {isPending ? (
          <>
            <Icon icon="eos-icons:loading" className="animate-spin" width={24} />
            در حال افزودن...
          </>
        ) : isOutOfStock ? (
          <>
            <Icon icon="ph:x-circle-duotone" width={24} />
            ناموجود
          </>
        ) : (
          <>
            <Icon icon="ph:shopping-cart-duotone" width={24} />
            افزودن به سبد خرید
          </>
        )}
      </button>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          disabled={isOutOfStock}
          className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 rounded-xl hover:border-pink-500 hover:text-pink-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon icon="ph:heart-duotone" width={20} />
          <span className="text-sm font-medium">علاقه‌مندی</span>
        </button>
        
        <button
          className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:text-blue-500 transition"
        >
          <Icon icon="ph:share-network-duotone" width={20} />
          <span className="text-sm font-medium">اشتراک‌گذاری</span>
        </button>
      </div>

      {/* Buy Now Button */}
      {!isOutOfStock && isAuthenticated && (
        <button
          className="w-full py-3 border-2 border-pink-500 text-pink-600 rounded-xl font-bold hover:bg-pink-50 transition flex items-center justify-center gap-2"
        >
          <Icon icon="ph:lightning-duotone" width={20} />
          خرید سریع
        </button>
      )}
    </div>
  );
}