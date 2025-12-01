
import { supabase } from "@/shared/lib/supabase/client";
import { CartItem, CartItemPayload, CartItemRow } from "../types/cartTypes";
import { useAuthStore } from "@/features/auth/store/auth.store";

export async function addToCartApi({ productId, quantity }: CartItemPayload) {
  // Try to get user ID from Supabase session first
  // const { data: { session } } = await supabase.auth.getSession();
  // let userId = session?.user?.id;
  const {user} = useAuthStore();
  const userId = user?.id;

  // If no Supabase session, get from custom auth cookie

  if (!userId) {
    throw new Error("لطفا وارد شوید");
  }

  // Validate product exists
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, stock")
    .eq("id", productId)
    .single();

  if (productError || !product) {
    throw new Error("محصول یافت نشد");
  }

  if (product.stock < quantity) {
    throw new Error("موجودی کافی نیست");
  }

  // Check if product already in cart
  const { data: existing, error: checkError } = await supabase
    .from("cart_items")
    .select("*")
    .eq("product_id", productId)
    .eq("user_id", userId)
    .maybeSingle();

  if (checkError) {
    console.error("Check cart error:", checkError);
    throw new Error("خطا در بررسی سبد خرید");
  }

  if (existing) {
    // Check if new quantity exceeds stock
    const newQuantity = existing.quantity + quantity;
    if (newQuantity > product.stock) {
      throw new Error("تعداد درخواستی بیش از موجودی انبار است");
    }

    // Update existing item
    const { data, error } = await supabase
      .from("cart_items")
      .update({ quantity: newQuantity })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      console.error("Update cart error:", error);
      throw new Error("خطا در بروزرسانی سبد خرید");
    }
    return data;
  } else {
    // Insert new item
    const { data, error } = await supabase
      .from("cart_items")
      .insert({
        user_id: userId,
        product_id: productId,
        quantity,
      })
      .select()
      .single();

    if (error) {
      console.error("Insert cart error:", error);
      throw new Error("خطا در افزودن به سبد خرید");
    }
    return data;
  }
}

// Helper to get user ID from cookie
// function getUserIdFromCookie(): string | undefined {
//   if (typeof window === 'undefined') return undefined;

//   try {
//     const cookies = document.cookie.split(';');
//     const sessionCookie = cookies.find(c => c.trim().startsWith('session_token='));

//     if (!sessionCookie) return undefined;

//     const token = sessionCookie.split('=')[1];
//     const decoded = Buffer.from(token, 'base64').toString('utf-8');
//     const session = JSON.parse(decoded);

//     return session.userId || undefined;
//   } catch {
//     return undefined;
//   }
// }

export async function fetchCartItems(): Promise<CartItem[]> {
   const {user} = useAuthStore();
  const userId = user?.id;
  
  if (!userId) {
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
    .eq("user_id", userId)
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

// Sync guest cart to database when user logs in (via API route)
export async function syncGuestCart(guestItems: CartItem[]) {
  // Prepare items for API
  const items = guestItems.map(item => ({
    product_id: item.product_id,
    quantity: item.quantity
  }));

  const response = await fetch('/api/cart/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'خطا در همگام‌سازی سبد خرید');
  }

  if (result.errors && result.errors.length > 0) {
    console.warn('Some items failed to sync:', result.errors);
  }

  return result;
}