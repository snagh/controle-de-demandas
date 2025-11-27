import { useState, useEffect, useCallback } from 'react'
// Using typed helpers for supabase interactions
import { fromHistorico, insertHistorico } from './supabaseHelpers'
import { apresentacoes, formatarMoeda } from './utils'
import type { Database, Tables } from './supabaseTypes'

type Item = Tables<'itens'>
type HistoricoEntrega = Tables<'historico_entregas'>

interface Props {
  item: Item
  aoFechar: () => void
}

export function ControleEntrega({ item, aoFechar }: Props) {
  const [historico, setHistorico] = useState<HistoricoEntrega[]>([])
  const [qtdEntregueHoje, setQtdEntregueHoje] = useState(0)
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)

  // Busca o histórico assim que mudou o item
  const buscarHistorico = useCallback(async () => {
    const { data } = await fromHistorico()
      .select('*')
      .eq('item_id', item.id)
      .order('data_entrega', { ascending: false })

    setHistorico((data as HistoricoEntrega[] | null) || [])
  }, [item.id])

  useEffect(() => {
    buscarHistorico()
  }, [buscarHistorico])

  // Cálculos
  const totalEntregue = historico.reduce((acc, curr) => acc + (Number(curr.quantidade_entregue) || 0), 0)
  const totalPedido = Number(item.quantidade) || 0
  const valorUnit = Number(item.valor_unitario) || 0
  const saldoRestante = totalPedido - totalEntregue
  const percentual = Math.min(totalPedido === 0 ? 0 : (totalEntregue / totalPedido) * 100, 100)
  
  // Salva nova entrega
  async function salvarEntrega() {
    if (qtdEntregueHoje <= 0) return alert('Quantidade inválida')
    if (qtdEntregueHoje > saldoRestante) return alert('Quantidade maior que o pendente!')
    
    setLoading(true)
    const { error } = await insertHistorico([{
        item_id: item.id,
        quantidade_entregue: qtdEntregueHoje,
        motivo_pendencia: motivo || 'Entrega registrada'
      }] as Database['public']['Tables']['historico_entregas']['Insert'][])
    
    if (!error) {
      setQtdEntregueHoje(0); setMotivo(''); buscarHistorico()
    } else {
      alert(error.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: '#fff', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', padding: '20px', borderRadius: '10px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h2 style={{ margin: 0 }}>🚚 Controle Logístico</h2>
          <button onClick={aoFechar} style={{ background: 'none', border: 'none', fontSize: '1.5em', cursor: 'pointer' }}>✖</button>
        </div>

        <div style={{ background: '#f4f6f7', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>{item.descricao}</h3>
          <div style={{ fontSize: '0.9em', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <span><strong>Apresentação:</strong> <span title={apresentacoes[item.unidade ?? '']} style={{borderBottom:'1px dotted #999', cursor:'help'}}>{item.unidade ?? ''}</span></span>
            <span><strong>Valor Unit:</strong> {formatarMoeda(valorUnit)}</span>
            <span><strong>Total Pedido:</strong> {totalPedido}</span>
            <span><strong>Valor Total:</strong> {formatarMoeda(totalPedido * valorUnit)}</span>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9em' }}>
            <strong>Entregue: {totalEntregue}</strong>
            <strong style={{ color: saldoRestante === 0 ? 'green' : '#e67e22' }}>Faltam: {saldoRestante}</strong>
          </div>
          <div style={{ width: '100%', height: '12px', background: '#ecf0f1', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${percentual}%`, background: saldoRestante === 0 ? '#27ae60' : '#f39c12', height: '100%', transition: 'width 0.3s' }}></div>
          </div>
        </div>

        {/* Formulário de Entrega */}
        {saldoRestante > 0 ? (
          <div style={{ background: '#eafaf1', padding: '15px', borderRadius: '8px', border: '1px solid #abebc6' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#186a3b' }}>Registrar Chegada de Material</h4>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input type="number" placeholder="Qtd" style={{ width: '80px', padding: '8px' }} value={qtdEntregueHoje} onChange={e => setQtdEntregueHoje(Number(e.target.value))} />
              <input type="text" placeholder="Observação / Motivo" style={{ flex: 1, padding: '8px' }} value={motivo} onChange={e => setMotivo(e.target.value)} />
            </div>
            <button onClick={salvarEntrega} disabled={loading} style={{ width: '100%', padding: '8px', background: '#27ae60', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
              {loading ? 'Salvando...' : 'Confirmar Recebimento'}
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '15px', background: '#d1f2eb', color: '#117864', borderRadius: '8px' }}>✅ Item totalmente entregue!</div>
        )}

        {/* Histórico */}
        <h4 style={{ marginTop: '20px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Histórico de Entregas</h4>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {historico.length === 0 && <li style={{ color: '#999', fontSize: '0.9em' }}>Nenhum histórico...</li>}
          {historico.map(log => (
            <li key={log.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: '0.9em' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>+ {log.quantidade_entregue} itens</strong>
                  <span style={{ color: '#aaa' }}>{log.data_entrega ? new Date(log.data_entrega).toLocaleDateString() : '—'}</span>
              </div>
              <div style={{ color: '#666', fontStyle: 'italic' }}>"{log.motivo_pendencia}"</div>
            </li>
          ))}
        </ul>

      </div>
    </div>
  )
}