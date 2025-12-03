"use client";

import { Icon } from "@iconify/react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useAddToWishlist, useIsInWishlist, useRemoveFromWishlist } from "../hooks/useWishlist";

interface WishlistHeartButtonProps {
  productId: string;
  withLabel?: boolean;
  disabled?: boolean;
}

export default function WishlistHeartButton({
  productId,
  withLabel = false,
  disabled = false,
}: WishlistHeartButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const { mutate: addToWishlist, isPending: adding } = useAddToWishlist();
  const { mutate: removeFromWishlist, isPending: removing } = useRemoveFromWishlist();
  const isInWishlist = useIsInWishlist(productId);
  const router = useRouter();
  const pathname = usePathname();

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (disabled) return;

    if (!isAuthenticated) {
      const redirect = encodeURIComponent(pathname || "/");
      router.push(`/login?redirectedFrom=${redirect}`);
      return;
    }

    if (isInWishlist) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  const loading = adding || removing;

  const baseClasses =
    "inline-flex items-center justify-center gap-2 rounded-full transition border-2";

  const iconOnlyClasses =
    "w-9 h-9 bg-card border-border hover:border-accent-500 hover:bg-accent-50";

  const withLabelClasses =
    "px-4 py-3 border-neutral-300 hover:border-accent-500 hover:text-accent-500";

  const activeClasses = isInWishlist
    ? "border-accent-500 text-accent-500 bg-accent-50"
    : "text-neutral-700";

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled || loading}
      className={`${baseClasses} ${
        withLabel ? withLabelClasses : iconOnlyClasses
      } ${activeClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
      aria-pressed={isInWishlist}
      aria-label={isInWishlist ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
    >
      <Icon
        icon={isInWishlist ? "ph:heart-fill" : "ph:heart-duotone"}
        width={withLabel ? 20 : 18}
      />
      {withLabel && <span className="text-sm font-medium">علاقه‌مندی</span>}
    </button>
  );
}


