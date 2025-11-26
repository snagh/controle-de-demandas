import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { CriarNota } from './CriarNota'
import { ModalEditar, NotaData, Item } from './ModalEditar'
import { ControleEntrega } from './ControleEntrega'
import { formatarMoeda } from './utils'

function App() {
  const [notas, setNotas] = useState<(NotaData & { itens?: Item[] })[]>([])
  const [loading, setLoading] = useState(false)
  
  // Modais
  const [notaSelecionada, setNotaSelecionada] = useState<NotaData | null>(null)
  const [itemParaGerenciar, setItemParaGerenciar] = useState<Item | null>(null)

  async function buscarNotas() {
    setLoading(true)
    // Traz nota + itens ordenados por criação
    const { data, error } = await supabase
      .from('notas')
      .select('*, itens (*)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
    } else {
      // Cast seguro para os tipos conhecidos
      const notasTyped = (data as (NotaData & { itens?: Item[] })[] | null) || []
      setNotas(notasTyped)
    }

    setLoading(false)
  }

  useEffect(() => {
    buscarNotas()
  }, [])

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'Segoe UI, Arial, sans-serif', color: '#333' }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50' }}>Gestão de Empenhos e Estoque</h1>

      {/* COMPONENTE DE CADASTRO */}
      <CriarNota aoSalvar={buscarNotas} />

      {/* MODAIS (Só aparecem se tiver algo selecionado) */}
      {notaSelecionada && (
        <ModalEditar 
          nota={notaSelecionada} 
          aoFechar={() => setNotaSelecionada(null)} 
          aoSalvar={buscarNotas} 
        />
      )}

      {itemParaGerenciar && (
        <ControleEntrega 
          item={itemParaGerenciar} 
          aoFechar={() => setItemParaGerenciar(null)} 
        />
      )}

      <hr style={{ margin: '30px 0', border: '0', borderTop: '1px solid #ccc' }} />

      {/* LISTAGEM */}
      <h2 style={{ color: '#34495e' }}>📋 Documentos Lançados</h2>
      {loading && <p>Carregando...</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {notas.map((nota) => {
          // Cálculo Financeiro Visual (Teto vs Pedido)
          const totalItens = nota.itens?.reduce((acc: number, item: Item) => acc + (Number(item.quantidade) * Number(item.valor_unitario)), 0) || 0
          const saldoFinanceiro = (nota.valor_total_teto || 0) - totalItens

          return (
            <div 
              key={nota.id} 
              style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '20px', 
                background: nota.status_geral === 'REJEITADA' ? '#fff5f5' : '#fff',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
              }}
            >
              {/* CABEÇALHO DO CARD (Clicável para Editar Nota) */}
              <div 
                onClick={() => setNotaSelecionada(nota)}
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}
              >
                <div>
                  <span style={{ fontSize: '0.8em', color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 'bold' }}>{nota.tipo_documento}</span>
                  <h3 style={{ margin: '5px 0 0 0', color: '#2980b9' }}>#{nota.numero_ne}</h3>
                  <small style={{ color: '#555' }}>Emissor: {nota.emissor}</small>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.85em', fontWeight: 'bold',
                    background: nota.status_geral === 'APROVADA' ? '#d5f5e3' : '#eaeded',
                    color: nota.status_geral === 'APROVADA' ? '#196f3d' : '#333'
                  }}>
                    {nota.status_geral}
                  </span>
                  <div style={{ marginTop: '5px', fontSize: '0.85em' }}>
                    Chegada: {nota.data_recebimento ? new Date(nota.data_recebimento).toLocaleDateString() : '-'}
                  </div>
                </div>
              </div>

              {/* INFO FINANCEIRA */}
              <div style={{ background: '#fcf3cf', padding: '8px 12px', borderRadius: '6px', fontSize: '0.9em', display: 'flex', gap: '20px', marginBottom: '15px' }}>
                <span><strong>Teto:</strong> {formatarMoeda(nota.valor_total_teto || 0)}</span>
                <span><strong>Total Itens:</strong> {formatarMoeda(totalItens)}</span>
                <span style={{ color: saldoFinanceiro < 0 ? 'red' : 'green' }}>
                  <strong>Saldo Disponível:</strong> {formatarMoeda(saldoFinanceiro)}
                </span>
              </div>

              {/* LISTA DE ITENS (Clicável para Controle Logístico) */}
              <div style={{ fontSize: '0.9em' }}>
                <strong>Itens do Documento:</strong>
                <ul style={{ margin: '10px 0 0 0', padding: 0, listStyle: 'none' }}>
                  {nota.itens?.map((item: Item) => (
                    <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid #f4f4f4' }}>
                      <span>
                        <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>{item.quantidade} {item.unidade}</span> - {item.descricao}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation() // Não abre a nota, só o item
                          setItemParaGerenciar(item)
                        }}
                        style={{ padding: '5px 10px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em' }}
                      >
                        Gerenciar Entregas
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App