import { createClient } from '@supabase/supabase-js'

// O "as string" garante para o TypeScript que isso será um texto
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseKey) {
  console.error('ERRO: Variáveis de ambiente ausentes.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)