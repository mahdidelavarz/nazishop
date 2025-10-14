import { supabase } from "@/shared/lib/supabase";
import { Product } from "../types/productsType";


export const fetchProductsApi = async (): Promise<Product[]> => {
    const { data, error } = await supabase
        .from("products")
        .select("id, title, description, price, original_price, thumbnail_url, slug, brand")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data as Product[];
};

export const fetchSingleProductApi = async (slug: string): Promise<Product> => {
    const { data, error } = await supabase
        .from("products")
        .select(`
      id,
      title,
      description,
      price,
      original_price,
      brand,
      stock,
      thumbnail_url,
      slug,
      details:product_details(description, specifications, images)
    `)
        .eq("slug", slug)
        .single();

    if (error || !data) throw new Error(error?.message || "محصول یافت نشد");
    return data as Product;
};
