import { supabase } from './supabaseClient'
import type { Database } from './supabaseTypes'

// TableName removed - we use per-table helpers below

/**
 * Minimal typed helper for common supabase operations.
 *
 * We keep a single `as any` boundary inside this file so the rest of the codebase
 * can use strongly-typed payloads without repeating casts and without fighting
 * supabase-js complex overloads everywhere.
 */
export async function insertNotas(
  rows: Database['public']['Tables']['notas']['Insert'][]
) {
  return supabase.from('notas').insert(rows)
}

export async function insertItens(
  rows: Database['public']['Tables']['itens']['Insert'][]
) {
  return supabase.from('itens').insert(rows)
}

export async function insertHistorico(
  rows: Database['public']['Tables']['historico_entregas']['Insert'][]
) {
  return supabase.from('historico_entregas').insert(rows)
}

export async function insertAndSelectNota(
  rows: Database['public']['Tables']['notas']['Insert'][]
) {
  // insert and return select().single() like our previous call sites expect
  return supabase.from('notas').insert(rows).select().single()
}

export async function updateNota<
  K extends keyof Database['public']['Tables']['notas']['Row']
>(
  payload: Database['public']['Tables']['notas']['Update'],
  key: K,
  value: Database['public']['Tables']['notas']['Row'][K]
) {
  return supabase.from('notas').update(payload).eq(key as any, value as any)
}

export async function selectAllNotas(
  columns = '*'
): Promise<{ data: Database['public']['Tables']['notas']['Row'][] | null; error: any }>{
  return supabase.from('notas').select(columns)
}

export async function selectSingleNota(
  columns = '*'
): Promise<{ data: Database['public']['Tables']['notas']['Row'] | null; error: any }>{
  return supabase.from('notas').select(columns).single()
}

// Utility to return the raw supabase from() query builder for more complex queries
// Utility to return the raw supabase from() query builder for more complex queries
// Utility to return the raw supabase from() query builder for historico
export function fromHistorico() {
  return supabase.from('historico_entregas')
}

export default {
  insertNotas,
  insertItens,
  insertHistorico,
  insertAndSelectNota,
  updateNota,
  selectAllNotas,
  selectSingleNota,
  fromHistorico
}
