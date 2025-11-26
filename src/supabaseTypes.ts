// Central database types for Supabase

export type Nota = {
  id: number
  numero_ne: string
  emissor?: string | null
  tipo_documento?: string | null
  status_geral?: string | null
  status_estoque?: string | null
  data_contato_vendedor?: string | null
  previsao_entrega?: string | null
  motivo_rejeicao?: string | null
  data_emissao?: string | null
  data_validade?: string | null
  valor_total_teto?: number | null
  data_recebimento?: string | null
  created_at?: string | null
}

export type Item = {
  id: number
  nota_id?: number | null
  descricao: string
  quantidade: number
  unidade: string
  valor_unitario: number
  created_at?: string | null
}

export type HistoricoEntrega = {
  id: number
  item_id?: number | null
  quantidade_entregue: number
  data_entrega?: string | null
  motivo_pendencia?: string | null
  created_at?: string | null
}

export interface Database {
  public: {
    Tables: {
      notas: {
        Row: Nota
        Insert: Omit<Nota, 'id' | 'created_at'> & { id?: number }
        Update: Partial<Omit<Nota, 'id' | 'created_at'>> & { id?: number }
      }
      itens: {
        Row: Item
        Insert: Omit<Item, 'id' | 'created_at'> & { id?: number }
        Update: Partial<Omit<Item, 'id' | 'created_at'>> & { id?: number }
      }
      historico_entregas: {
        Row: HistoricoEntrega
        Insert: Omit<HistoricoEntrega, 'id' | 'created_at'> & { id?: number }
        Update: Partial<Omit<HistoricoEntrega, 'id' | 'created_at'>> & { id?: number }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
