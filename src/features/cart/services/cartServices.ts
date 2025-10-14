import { supabase } from "@/shared/lib/supabase";
import { CartItem, CartItemPayload, CartItemRow } from "../types/cartTypes";
import { supabaseService } from "@/shared/lib/supabaseService";

export async function addToCartApi({ productId, quantity }: CartItemPayload) {
    // Tell TS that we expect CartItemRow
    const existing = await supabaseService.get<CartItemRow>("cart_items", { product_id: productId });

    if (existing?.length) {
        return supabaseService.update<CartItemRow>(
            "cart_items",
            { quantity: existing[0].quantity + quantity },
            { id: existing[0].id }
        );
    } else {
        return supabaseService.insert<CartItemRow>("cart_items", { product_id: productId, quantity });
    }
}


export async function fetchCartItems(): Promise<CartItem[]> {
    const { data, error } = await supabase
        .from("cart_items")
        .select(`
      id,
      product_id,
      quantity,
      products:products(id, title, price, thumbnail_url)
    `)
        .order("created_at", { ascending: false });

    if (error) throw error;

    // normalize products to single object (Supabase returns array)
    return (data as any[]).map(item => ({
        ...item,
        products: item.products?.[0] || null,
    }));
}


export async function removeCartItem(cartItemId: string) {
    const { data, error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", cartItemId);

    if (error) throw error;
    return data;
}
