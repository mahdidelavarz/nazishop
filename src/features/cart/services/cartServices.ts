import { supabase } from "@/shared/lib/supabase";
import { CartItem, CartItemPayload, CartItemRow } from "../types/cartTypes";

export async function addToCartApi({ productId, quantity }: CartItemPayload) {
  // Get current user session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("لطفا وارد شوید");
  }

  // Check if product already in cart
  const { data: existing, error: checkError } = await supabase
    .from("cart_items")
    .select("*")
    .eq("product_id", productId)
    .eq("user_id", session.user.id)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    throw checkError;
  }

  if (existing) {
    // Update existing item
    const { data, error } = await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Insert new item
    const { data, error } = await supabase
      .from("cart_items")
      .insert({
        user_id: session.user.id,
        product_id: productId,
        quantity,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export async function fetchCartItems(): Promise<CartItem[]> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return [];
  }

  const { data, error } = await supabase
    .from("cart_items")
    .select(`
      id,
      product_id,
      quantity,
      products:products(id, title, price, thumbnail_url)
    `)
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Normalize products to single object
  return (data as any[]).map((item) => ({
    ...item,
    products: item.products || null,
  }));
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  if (quantity < 1) {
    throw new Error("تعداد باید حداقل ۱ باشد");
  }

  const { data, error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", cartItemId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeCartItem(cartItemId: string) {
  const { data, error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", cartItemId);

  if (error) throw error;
  return data;
}

// Sync guest cart to database when user logs in
export async function syncGuestCart(guestItems: CartItem[]) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("لطفا وارد شوید");
  }

  // Add each guest item to database
  for (const item of guestItems) {
    await addToCartApi({
      productId: item.product_id,
      quantity: item.quantity,
    });
  }
}