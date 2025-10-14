import { supabase } from "@/shared/lib/supabase";
import toast from "react-hot-toast";

type TableName = "cart_items" | "products" | "orders";

async function withUser<T>(fn: (userId: string) => Promise<T>) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) throw new Error("User not logged in");

  return fn(user.id);
}

export const supabaseService = {
  get: async <R>(table: TableName, query?: Partial<R>): Promise<R[]> =>
    withUser(async (userId) => {
      const { data, error } = await supabase
        .from(table)        // <-- only table name here
        .select("*")        // <-- optionally you can type this: .select<R>()
        .match({ ...query, user_id: userId });

      if (error) throw error;
      return (data ?? []) as R[];
    }),

  insert: async <R>(table: TableName, payload: Partial<R>): Promise<R[]> =>
    withUser(async (userId) => {
      const { data, error } = await supabase
        .from(table)       // table name only
        .insert({ ...payload, user_id: userId });

      if (error) throw error;
      return (data ?? []) as R[];
    }),

  update: async <R>(
    table: TableName,
    payload: Partial<R>,
    match: Partial<R>
  ): Promise<R[]> =>
    withUser(async (userId) => {
      const { data, error } = await supabase
        .from(table)       // table name only
        .update(payload)
        .match({ ...match, user_id: userId });

      if (error) throw error;
      return (data ?? []) as R[];
    }),

  delete: async <R>(table: TableName, match: Partial<R>): Promise<R[]> =>
    withUser(async (userId) => {
      const { data, error } = await supabase
        .from(table)       // table name only
        .delete()
        .match({ ...match, user_id: userId });

      if (error) throw error;
      return (data ?? []) as R[];
    }),
};