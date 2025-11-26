import { useState } from 'react'
import { supabase } from './supabaseClient'
import { tiposDocumento } from './utils'
import type { Nota, Item as DBItem } from './supabaseTypes'

// Re-export DB types under the names used elsewhere in the app for compatibility
export type NotaData = Nota
export type Item = DBItem

interface ModalProps {
  nota: NotaData // Aqui dizemos que 'nota' segue o contrato acima
  aoFechar: () => void
  aoSalvar: () => void
}

export function ModalEditar({ nota, aoFechar, aoSalvar }: ModalProps) {
  const [loading, setLoading] = useState(false)
  
  // --- ESTADOS DO FORMULÁRIO ---
  // Inicializamos com o valor que veio do banco OU vazio se for nulo
  const [statusGeral, setStatusGeral] = useState(nota.status_geral || 'PENDENTE')
  const [statusEstoque, setStatusEstoque] = useState(nota.status_estoque || '')
  
  // Datas
  const [dataContato, setDataContato] = useState(nota.data_contato_vendedor || '')
  const [previsaoEntrega, setPrevisaoEntrega] = useState(nota.previsao_entrega || '')
  const [dataValidade, setDataValidade] = useState(nota.data_validade || '')
  
  // Financeiro e Detalhes
  const [valorTeto, setValorTeto] = useState(nota.valor_total_teto || 0)
  const [tipoDoc, setTipoDoc] = useState(nota.tipo_documento || 'NOTA DE EMPENHO')
  const [obs, setObs] = useState(nota.motivo_rejeicao || '')

  async function salvarAlteracoes() {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('notas')
        .update({
          status_geral: statusGeral,
          status_estoque: statusEstoque || null, // Se estiver vazio, salva null no banco
          data_contato_vendedor: dataContato || null,
          previsao_entrega: previsaoEntrega || null,
          data_validade: dataValidade || null,
          valor_total_teto: valorTeto,
          tipo_documento: tipoDoc,
          motivo_rejeicao: obs
        } as import('./supabaseTypes').Database['public']['Tables']['notas']['Update'])
        .eq('id', nota.id) // Garante que só altera ESSA nota

        if (error) throw error

      aoSalvar() // Recarrega a lista no App.tsx
      aoFechar() // Fecha o modal

    } catch (error: unknown) {
      // Tratamento de erro seguro no TypeScript
      if (error instanceof Error) {
        alert('Erro ao atualizar: ' + error.message)
      } else {
        alert('Erro desconhecido ao atualizar.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000 // Garante que fica em cima de tudo
    }}>
      <div style={{ background: 'white', padding: '25px', borderRadius: '10px', width: '600px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
        
        <h2 style={{ margin: '0 0 20px 0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
          Editar: {nota.numero_ne}
        </h2>

        <div style={{ display: 'grid', gap: '15px' }}>
          
          {/* BLOCO 1: DADOS BÁSICOS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{fontWeight: 'bold', fontSize: '0.9em'}}>Tipo de Documento</label>
              <select 
                style={{ width: '100%', padding: '8px' }} 
                value={tipoDoc} 
                onChange={(e) => setTipoDoc(e.target.value)}
              >
                {tiposDocumento.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{fontWeight: 'bold', fontSize: '0.9em'}}>Valor Teto (R$)</label>
              <input 
                type="number" step="0.01"
                style={{ width: '100%', padding: '8px' }} 
                value={valorTeto} 
                onChange={(e) => setValorTeto(Number(e.target.value))} 
              />
            </div>
          </div>

          {/* BLOCO 2: STATUS DO FLUXO (O mais importante) */}
          <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <label style={{fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Status do Processo</label>
            <select 
              style={{ width: '100%', padding: '10px', fontWeight: 'bold' }} 
              value={statusGeral} 
              onChange={(e) => setStatusGeral(e.target.value)}
            >
              <option value="PENDENTE">⏳ Pendente</option>
              <option value="APROVADA">✅ Aprovada (Em Andamento)</option>
              <option value="REJEITADA">❌ Rejeitada / Devolvida</option>
              <option value="ENTREGUE">🏁 Finalizada (Entregue)</option>
            </select>
          </div>

          {/* BLOCO 3: DATAS E PRAZOS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{fontSize: '0.85em'}}>Contato Vendedor</label>
              <input 
                type="date" style={{ width: '100%', padding: '8px' }} 
                value={dataContato} 
                onChange={(e) => setDataContato(e.target.value)} 
              />
            </div>
            <div>
              <label style={{fontSize: '0.85em'}}>Previsão Entrega</label>
              <input 
                type="date" style={{ width: '100%', padding: '8px' }} 
                value={previsaoEntrega} 
                onChange={(e) => setPrevisaoEntrega(e.target.value)} 
              />
            </div>
            <div>
              <label style={{fontSize: '0.85em'}}>Validade Doc.</label>
              <input 
                type="date" style={{ width: '100%', padding: '8px' }} 
                value={dataValidade} 
                onChange={(e) => setDataValidade(e.target.value)} 
              />
            </div>
          </div>

          {/* BLOCO 4: ESTOQUE E OBS */}
          <div>
            <label style={{fontWeight: 'bold', fontSize: '0.9em'}}>Situação Estoque (Fornecedor)</label>
            <select 
              style={{ width: '100%', padding: '8px' }} 
              value={statusEstoque} 
              onChange={(e) => setStatusEstoque(e.target.value)}
            >
              <option value="">-- Selecione --</option>
              <option value="TOTAL">📦 Total (Disponível)</option>
              <option value="PARCIAL">⚠️ Parcial</option>
              <option value="INDISPONIVEL">🚫 Indisponível (Falta)</option>
            </select>
          </div>

          <div>
            <label style={{fontWeight: 'bold', fontSize: '0.9em'}}>Observações / Motivo</label>
            <textarea 
              rows={3} 
              style={{ width: '100%', padding: '8px' }} 
              value={obs} 
              onChange={(e) => setObs(e.target.value)} 
              placeholder="Ex: Aguardando carta de troca de marca..."
            />
          </div>

          {/* BOTÕES */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
            <button 
              onClick={aoFechar} 
              style={{ flex: 1, padding: '12px', background: '#ecf0f1', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#7f8c8d' }}
            >
              Cancelar
            </button>
            <button 
              onClick={salvarAlteracoes} 
              disabled={loading} 
              style={{ flex: 1, padding: '12px', background: '#2980b9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: 'white' }}
            >
              {loading ? 'Salvando...' : '💾 Salvar Alterações'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}