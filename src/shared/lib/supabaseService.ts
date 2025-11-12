// src/shared/services/supabaseService.ts
import { supabase } from '@/shared/lib/supabase/client'
import { Database } from '@/shared/lib/supabase/database.types'
import {
  createUnauthorizedError,
  createDatabaseError,
  logError,
} from '@/shared/utils/errors'

type TableName = keyof Database['public']['Tables']
type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row']
type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert']
type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update']

interface QueryOptions {
  orderBy?: string
  ascending?: boolean
  limit?: number
  offset?: number
  select?: string
}

async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    logError(error, 'Get Current User')
    throw createUnauthorizedError('خطا در دریافت اطلاعات کاربر')
  }

  if (!user) {
    throw createUnauthorizedError('لطفا وارد حساب کاربری خود شوید')
  }

  return user.id
}

export const supabaseService = {
  get: async <T extends TableName>(
    table: T,
    match?: Partial<TableRow<T>>,
    options?: QueryOptions
  ): Promise<TableRow<T>[]> => {
    const userId = await getCurrentUserId()

    let query = supabase
      .from(table)
      .select(options?.select || '*')
      .eq('user_id' as any, userId)

    if (match) {
      Object.entries(match).forEach(([key, value]) => {
        if (value !== undefined) {
          query = query.eq(key as any, value)
        }
      })
    }

    if (options?.orderBy) {
      query = query.order(options.orderBy as any, {
        ascending: options.ascending ?? false,
      })
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 10) - 1
      )
    }

    const { data, error } = await query

    if (error) {
      logError(error, `Supabase GET - ${table}`)
      throw createDatabaseError(`خطا در دریافت اطلاعات از ${table}`)
    }

    return data as unknown as TableRow<T>[]
  },

  getOne: async <T extends TableName>(
    table: T,
    match: Partial<TableRow<T>>,
    options?: Pick<QueryOptions, 'select'>
  ): Promise<TableRow<T> | null> => {
    const userId = await getCurrentUserId()

    let query = supabase
      .from(table)
      .select(options?.select || '*')
      .eq('user_id' as any, userId)

    Object.entries(match).forEach(([key, value]) => {
      if (value !== undefined) {
        query = query.eq(key as any, value)
      }
    })

    const { data, error } = await query.maybeSingle()

    if (error) {
      logError(error, `Supabase GET ONE - ${table}`)
      throw createDatabaseError(`خطا در دریافت اطلاعات از ${table}`)
    }

    return data as unknown as TableRow<T> | null
  },

  getById: async <T extends TableName>(
    table: T,
    id: string,
    options?: Pick<QueryOptions, 'select'>
  ): Promise<TableRow<T> | null> => {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from(table)
      .select(options?.select || '*')
      .eq('id' as any, id)
      .eq('user_id' as any, userId)
      .maybeSingle()

    if (error) {
      logError(error, `Supabase GET BY ID - ${table}`)
      throw createDatabaseError(`خطا در دریافت اطلاعات از ${table}`)
    }

    return data as unknown as TableRow<T> | null
  },

  insert: async <T extends TableName>(
    table: T,
    payload: Omit<TableInsert<T>, 'user_id' | 'created_at' | 'id'>
  ): Promise<TableRow<T>> => {
    const userId = await getCurrentUserId()

    const insertData: any = {
      ...payload,
      user_id: userId,
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from(table)
      .insert(insertData)
      .select()
      .single()

    if (error) {
      logError(error, `Supabase INSERT - ${table}`)
      throw createDatabaseError(`خطا در ذخیره اطلاعات در ${table}`)
    }

    return data as unknown as TableRow<T>
  },

  insertMany: async <T extends TableName>(
    table: T,
    payloads: Array<Omit<TableInsert<T>, 'user_id' | 'created_at' | 'id'>>
  ): Promise<TableRow<T>[]> => {
    const userId = await getCurrentUserId()

    const insertData: any[] = payloads.map((payload) => ({
      ...payload,
      user_id: userId,
      created_at: new Date().toISOString(),
    }))

    const { data, error } = await supabase.from(table).insert(insertData).select()

    if (error) {
      logError(error, `Supabase INSERT MANY - ${table}`)
      throw createDatabaseError(`خطا در ذخیره اطلاعات در ${table}`)
    }

    return data as unknown as TableRow<T>[]
  },

  update: async <T extends TableName>(
    table: T,
    payload: Partial<TableUpdate<T>>,
    match: Partial<TableRow<T>>
  ): Promise<TableRow<T>[]> => {
    const userId = await getCurrentUserId()

    let query = supabase
      .from(table)
      .update(payload as any)
      .eq('user_id' as any, userId)

    Object.entries(match).forEach(([key, value]) => {
      if (value !== undefined) {
        query = query.eq(key as any, value)
      }
    })

    const { data, error } = await query.select()

    if (error) {
      logError(error, `Supabase UPDATE - ${table}`)
      throw createDatabaseError(`خطا در به‌روزرسانی ${table}`)
    }

    return data as unknown as TableRow<T>[]
  },

  updateById: async <T extends TableName>(
    table: T,
    id: string,
    payload: Partial<TableUpdate<T>>
  ): Promise<TableRow<T>> => {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from(table)
      .update(payload as any)
      .eq('id' as any, id)
      .eq('user_id' as any, userId)
      .select()
      .single()

    if (error) {
      logError(error, `Supabase UPDATE BY ID - ${table}`)
      throw createDatabaseError(`خطا در به‌روزرسانی ${table}`)
    }

    return data as unknown as TableRow<T>
  },

  delete: async <T extends TableName>(
    table: T,
    match: Partial<TableRow<T>>
  ): Promise<TableRow<T>[]> => {
    const userId = await getCurrentUserId()

    let query = supabase.from(table).delete().eq('user_id' as any, userId)

    Object.entries(match).forEach(([key, value]) => {
      if (value !== undefined) {
        query = query.eq(key as any, value)
      }
    })

    const { data, error } = await query.select()

    if (error) {
      logError(error, `Supabase DELETE - ${table}`)
      throw createDatabaseError(`خطا در حذف از ${table}`)
    }

    return data as unknown as TableRow<T>[]
  },

  deleteById: async <T extends TableName>(
    table: T,
    id: string
  ): Promise<TableRow<T>> => {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from(table)
      .delete()
      .eq('id' as any, id)
      .eq('user_id' as any, userId)
      .select()
      .single()

    if (error) {
      logError(error, `Supabase DELETE BY ID - ${table}`)
      throw createDatabaseError(`خطا در حذف از ${table}`)
    }

    return data as unknown as TableRow<T>
  },

  count: async <T extends TableName>(
    table: T,
    match?: Partial<TableRow<T>>
  ): Promise<number> => {
    const userId = await getCurrentUserId()

    let query = supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq('user_id' as any, userId)

    if (match) {
      Object.entries(match).forEach(([key, value]) => {
        if (value !== undefined) {
          query = query.eq(key as any, value)
        }
      })
    }

    const { count, error } = await query

    if (error) {
      logError(error, `Supabase COUNT - ${table}`)
      throw createDatabaseError(`خطا در شمارش ${table}`)
    }

    return count || 0
  },

  upsert: async <T extends TableName>(
    table: T,
    payload: Omit<TableInsert<T>, 'user_id' | 'created_at'>,
    options?: {
      onConflict?: string
      ignoreDuplicates?: boolean
    }
  ): Promise<TableRow<T>> => {
    const userId = await getCurrentUserId()

    const upsertData: any = {
      ...payload,
      user_id: userId,
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from(table)
      .upsert(upsertData, {
        onConflict: options?.onConflict,
        ignoreDuplicates: options?.ignoreDuplicates,
      })
      .select()
      .single()

    if (error) {
      logError(error, `Supabase UPSERT - ${table}`)
      throw createDatabaseError(`خطا در ذخیره/به‌روزرسانی ${table}`)
    }

    return data as unknown as TableRow<T>
  },
}