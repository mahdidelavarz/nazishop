// import { supabase } from "@/shared/lib/supabase";
// import { CartItem } from "../types/cartTypes";
// import { useLocalCartStore } from "../store/localCartStore";
// import toast from "react-hot-toast";

// export async function mergeLocalCartToServer(userId: string, localItems: any[]) {
//   if (!localItems?.length) return;

//   try {
//     // Fetch existing items for this user
//     const { data: existing, error: fetchError } = await supabase
//       .from("cart_items")
//       .select("product_id, quantity")
//       .eq("user_id", userId);

//     if (fetchError) throw fetchError;

//     const existingMap = new Map(existing?.map((i) => [i.product_id, i.quantity]) || []);

//     // Prepare data to insert or update
//     const toInsert: any[] = [];
//     const toUpdate: any[] = [];

//     for (const item of localItems) {
//       const existingQty = existingMap.get(item.product_id);
//       if (existingQty != null) {
//         // If already exists, update quantity
//         toUpdate.push({
//           product_id: item.product_id,
//           new_quantity: existingQty + item.quantity,
//         });
//       } else {
//         // Otherwise, insert new record
//         toInsert.push({
//           user_id: userId,
//           product_id: item.product_id,
//           quantity: item.quantity,
//         });
//       }
//     }

//     // Bulk insert new items
//     if (toInsert.length > 0) {
//       const { error: insertError } = await supabase.from("cart_items").insert(toInsert);
//       if (insertError) throw insertError;
//     }

//     // Update existing items
//     for (const u of toUpdate) {
//       const { error: updateError } = await supabase
//         .from("cart_items")
//         .update({ quantity: u.new_quantity })
//         .eq("user_id", userId)
//         .eq("product_id", u.product_id);
//       if (updateError) throw updateError;
//     }

//     // Clear local cart
//     useLocalCartStore.getState().clear();
//     toast.success("سبد خرید شما با حساب کاربری همگام‌سازی شد ✅");
//   } catch (error: any) {
//     console.error("mergeLocalCartToServer error:", error.message);
//     toast.error("خطا در همگام‌سازی سبد خرید");
//   }
// }

// function mergeCarts(serverCart: CartItem[], localCart: CartItem[]): CartItem[] {
//   const merged = [...serverCart];
//   for (const item of localCart) {
//     const existing = merged.find((c) => c.product_id === item.product_id);
//     if (existing) existing.quantity += item.quantity;
//     else merged.push(item);
//   }
//   return merged;
// }
