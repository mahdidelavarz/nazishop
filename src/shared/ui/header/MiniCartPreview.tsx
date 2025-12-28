"use client";

import { Icon } from '@iconify/react';
import Link from 'next/link';
import Image from 'next/image';
import { CartItem } from '@/features/cart/types/cartTypes';

interface MiniCartPreviewProps {
  show: boolean;
  items: CartItem[];
  itemCount: number;
}

export function MiniCartPreview({ show, items, itemCount }: MiniCartPreviewProps) {
  if (!show) return null;

  // Calculate total price
  const totalPrice = items.reduce((sum, item) => {
    if (!item.products) return sum;
    const price = item.products.price || 0;
    const discount = item.products.discount || 0;
    const finalPrice = price * (1 - discount / 100);
    return sum + finalPrice * item.quantity;
  }, 0);

  return (
    <div className="absolute left-0 top-12 mt-2 w-80 bg-card rounded-2xl shadow-2xl border border-border z-50 max-h-[500px] flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm">سبد خرید شما</h3>
          <span className="text-xs text-muted-foreground">{itemCount} محصول</span>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 p-4">
        {itemCount === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Icon icon="ph:shopping-cart-duotone" width={48} className="mx-auto mb-2 opacity-50" />
            <p>سبد خرید شما خالی است</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 5).map((item) => {
              if (!item.products) return null;
              
              const price = item.products.price || 0;
              const discount = item.products.discount || 0;
              const finalPrice = price * (1 - discount / 100);
              const itemTotal = finalPrice * item.quantity;

              return (
                <div key={item.id} className="flex items-center gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    {item.products.thumbnail_url ? (
                      <Image
                        src={item.products.thumbnail_url}
                        alt={item.products.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon icon="ph:image-duotone" width={24} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground truncate">
                      {item.products.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {item.quantity} × {finalPrice.toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-sm text-primary-600">
                      {itemTotal.toLocaleString('fa-IR')} تومان
                    </span>
                  </div>
                </div>
              );
            })}
            {items.length > 5 && (
              <div className="text-center text-xs text-muted-foreground pt-2">
                و {items.length - 5} محصول دیگر...
              </div>
            )}
          </div>
        )}
      </div>

      {itemCount > 0 && (
        <div className="p-4 border-t border-border space-y-2 bg-muted/30">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">جمع کل:</span>
            <span className="font-bold text-primary-600">
              {totalPrice.toLocaleString('fa-IR')} تومان
            </span>
          </div>
          <Link
            href="/cart"
            className="block w-full bg-gradient-to-r from-primary-500 to-accent-500 text-white text-center py-2.5 rounded-xl font-medium hover:shadow-lg transition-all"
          >
            مشاهده سبد خرید
          </Link>
        </div>
      )}
    </div>
  );
}

