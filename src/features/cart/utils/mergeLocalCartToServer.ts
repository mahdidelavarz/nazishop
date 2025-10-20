import { supabase } from "@/shared/lib/supabase";
import { CartItem } from "../types/cartTypes";

export async function mergeLocalCartToServer(userId: string) {
  try {
    // read local cart from localStorage
    const localCart = JSON.parse(
      localStorage.getItem("cart") || "[]"
    ) as CartItem[];

    if (!localCart.length) return;

    // fetch user's existing cart from Supabase
    const { data: existingCart } = await supabase
      .from("cart")
      .select("*")
      .eq("user_id", userId);

    const mergedCart = mergeCarts(existingCart || [], localCart);

    // upsert merged cart back to Supabase
    await supabase.from("cart").upsert(mergedCart);

    // clear local cart now that it’s synced
    localStorage.removeItem("cart");
  } catch (err) {
    console.error("Error merging cart:", err);
  }
}

function mergeCarts(serverCart: CartItem[], localCart: CartItem[]): CartItem[] {
  const merged = [...serverCart];
  for (const item of localCart) {
    const existing = merged.find((c) => c.product_id === item.product_id);
    if (existing) existing.quantity += item.quantity;
    else merged.push(item);
  }
  return merged;
}
