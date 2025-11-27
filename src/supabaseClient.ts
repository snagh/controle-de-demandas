import { createClient } from '@supabase/supabase-js'

// O "as string" garante para o TypeScript que isso será um texto
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseKey) {
  console.error('ERRO: Variáveis de ambiente ausentes.')
}

// Leave client untyped (use explicit casts on queries as needed) to avoid over-strict supabase-js generics
// Keep the client untyped for now to avoid constraining library generics.
// For stricter typing we can re-enable createClient<Database> after aligning all query shapes.
export const supabase = createClient(supabaseUrl, supabaseKey)