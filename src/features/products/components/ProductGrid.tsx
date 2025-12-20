// features/products/components/ProductGrid.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { ProductListItem } from "@/features/products/types/productsType";
import { ProductCard } from "./ProductCard";
import { ProductListCard } from "./ProductListCard";
import { ViewMode } from "@/features/products/store/productsStore";

interface ProductGridProps {
  products: ProductListItem[];
  viewMode: ViewMode;
}

const INITIAL_LOAD = 12;
const LOAD_MORE = 12;

export function ProductGrid({ products, viewMode }: ProductGridProps) {
  const [displayCount, setDisplayCount] = useState(INITIAL_LOAD);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDisplayCount(INITIAL_LOAD);
  }, [products]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < products.length) {
          setDisplayCount((prev) => Math.min(prev + LOAD_MORE, products.length));
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [displayCount, products.length]);

  const displayedProducts = products.slice(0, displayCount);
  const hasMore = displayCount < products.length;

  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        {displayedProducts.map((product) => (
          <ProductListCard key={product.id} product={product} />
        ))}
        {hasMore && (
          <div ref={loaderRef} className="py-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {displayedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {hasMore && (
        <div ref={loaderRef} className="py-8 text-center">
          <div className="inline-block w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}