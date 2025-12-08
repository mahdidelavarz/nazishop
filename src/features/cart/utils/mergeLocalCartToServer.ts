
import { CartItem } from "../types/cartTypes";
import { useLocalCartStore } from "../store/localCartStore";
import toast from "react-hot-toast";
import { supabase } from "@/shared/lib/supabase/client";

type LocalItem = {
  product_id: string;
  quantity: number;
};

export async function mergeLocalCartToServer(userId: string, localItems: LocalItem[]) {
  if (!localItems?.length) return;

  try {
    // Fetch existing items for this user
    const { data: existing, error: fetchError } = await supabase
      .from("cart_items")
      .select("product_id, quantity")
      .eq("user_id", userId);

    if (fetchError) throw fetchError;

    const existingMap = new Map(
      (existing ?? []).map((i) => [i.product_id as string, i.quantity as number])
    );

    // Prepare data to insert or update
    const toInsert: { user_id: string; product_id: string; quantity: number }[] = [];
    const toUpdate: { product_id: string; new_quantity: number }[] = [];

    for (const item of localItems) {
      const existingQty = existingMap.get(item.product_id);
      if (existingQty != null) {
        // If already exists, update quantity
        toUpdate.push({
          product_id: item.product_id,
          new_quantity: existingQty + item.quantity,
        });
      } else {
        // Otherwise, insert new record
        toInsert.push({
          user_id: userId,
          product_id: item.product_id,
          quantity: item.quantity,
        });
      }
    }

    // Bulk insert new items
    if (toInsert.length > 0) {
      const { error: insertError } = await supabase.from("cart_items").insert(toInsert);
      if (insertError) throw insertError;
    }

    // Update existing items
    for (const u of toUpdate) {
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: u.new_quantity })
        .eq("user_id", userId)
        .eq("product_id", u.product_id);
      if (updateError) throw updateError;
    }

    // Clear local cart
    useLocalCartStore.getState().clear();
    toast.success("سبد خرید شما با حساب کاربری همگام‌سازی شد ✅");
  } catch (error: unknown) {
    console.error("mergeLocalCartToServer error:", error);
    toast.error("خطا در همگام‌سازی سبد خرید");
  }
}
