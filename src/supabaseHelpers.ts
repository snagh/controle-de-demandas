import { supabase } from './supabaseClient'
import type { Database } from './supabaseTypes'

type TableName = keyof Database['public']['Tables']

/**
 * Minimal typed helper for common supabase operations.
 *
 * We keep a single `as any` boundary inside this file so the rest of the codebase
 * can use strongly-typed payloads without repeating casts and without fighting
 * supabase-js complex overloads everywhere.
 */
export async function insertRows<T extends TableName>(
  table: T,
  rows: Database['public']['Tables'][T]['Insert'][]
) {
  return (supabase.from(table) as any).insert(rows)
}

export async function insertAndSelect<T extends TableName>(
  table: T,
  rows: Database['public']['Tables'][T]['Insert'][]
) {
  // insert and return select().single() like our previous call sites expect
  return (supabase.from(table) as any).insert(rows).select().single()
}

export async function updateRows<T extends TableName>(
  table: T,
  payload: Database['public']['Tables'][T]['Update'],
  key: string,
  value: unknown
) {
  return (supabase.from(table) as any).update(payload).eq(key, value)
}

export async function selectAll<T extends TableName>(
  table: T,
  columns = '*'
): Promise<{ data: Database['public']['Tables'][T]['Row'][] | null; error: any }>{
  // We still return the raw result object from supabase; callers can narrow as needed.
  return (supabase.from(table) as any).select(columns)
}

export async function selectSingle<T extends TableName>(
  table: T,
  columns = '*'
): Promise<{ data: Database['public']['Tables'][T]['Row'] | null; error: any }>{
  return (supabase.from(table) as any).select(columns).single()
}

// Utility to return the raw supabase from() query builder for more complex queries
// Utility to return the raw supabase from() query builder for more complex queries
export function from<T extends TableName>(table: T) {
  return (supabase.from(table) as any)
}

export default {
  insertRows,
  updateRows,
  selectAll,
  selectSingle,
  insertAndSelect,
  from
}
