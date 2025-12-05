import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { CriarNota } from './CriarNota'
import { ModalEditar } from './ModalEditar'
import { ControleEntrega } from './ControleEntrega'
import { formatarMoeda } from './utils'
import type { Tables } from './supabaseTypes'

// Tipos auxiliares
type Nota = Tables<'notas'>
type Item = Tables<'itens'>

// Tipo Composto (Nota + Itens)
type NotaComItens = Nota & { itens: Item[] }

function App() {
  const [notas, setNotas] = useState<NotaComItens[]>([])
  const [loading, setLoading] = useState(false)
  const [busca, setBusca] = useState('') // Estado da busca
  
  // Modais
  const [notaSelecionada, setNotaSelecionada] = useState<Nota | null>(null)
  const [itemParaGerenciar, setItemParaGerenciar] = useState<Item | null>(null)

  async function buscarNotas() {
    setLoading(true)
    const { data, error } = await supabase
      .from('notas')
      .select('*, itens (*)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      alert('Erro ao buscar notas')
    } else {
      // O Supabase retorna os itens dentro da nota, precisamos avisar o TS disso
      setNotas((data as unknown) as NotaComItens[])
    }
    setLoading(false)
  }

  useEffect(() => {
    buscarNotas()
    buscarNotas()
  }, [])

  // --- THEME TOGGLE LOGIC ---
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')

  useEffect(() => {
    // Apply theme to document root
    const root = document.documentElement
    if (theme === 'system') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', theme)
    }
  }, [theme])

  function toggleTheme() {
    setTheme(current => {
       if (current === 'system') return 'light' // Start with light override
       if (current === 'light') return 'dark'
       return 'system'
    })
  }

  const themeIcon = theme === 'system' ? '🌓' : theme === 'light' ? '☀️' : '🌙'

  // Lógica de Filtro (Busca Local)
  const notasFiltradas = notas.filter(nota => {
    const termo = busca.toLowerCase()
    return (
      nota.numero_ne.toLowerCase().includes(termo) ||
      (nota.emissor && nota.emissor.toLowerCase().includes(termo)) ||
      (nota.status_geral && nota.status_geral.toLowerCase().includes(termo)) ||
      (nota.tipo_documento && nota.tipo_documento.toLowerCase().includes(termo))
    )
  })

  return (
    <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '40px', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)', position: 'relative' }}>
      
      <div style={{ position: 'absolute', top: '40px', right: '40px' }}>
         <button onClick={toggleTheme} title="Alternar Tema (Auto/Claro/Escuro)" style={{ fontSize: '1.2em', padding: '10px' }}>
            {themeIcon}
         </button>
      </div>

      <h1 style={{ textAlign: 'center', color: 'var(--header-text)' }}>Gestão de Empenhos</h1>

      <CriarNota aoSalvar={buscarNotas} />

      {/* MODAIS */}
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

      <h2 style={{ color: 'var(--header-text)' }}>📋 Documentos Lançados</h2>
      
      {/* BARRA DE BUSCA */}
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="🔍 Buscar por NE, Cliente ou Status..." 
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ width: '100%', padding: '12px', fontSize: '1.1em', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
        />
      </div>

      {loading && <p>Carregando...</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {notasFiltradas.length === 0 && !loading && (
          <p style={{ textAlign: 'center', color: '#999' }}>Nenhum documento encontrado.</p>
        )}

        {notasFiltradas.map((nota) => {
          // Cálculo Financeiro
          const totalItens = nota.itens?.reduce((acc, item) => 
            acc + ((item.quantidade ?? 0) * (item.valor_unitario ?? 0)), 0) || 0
          
          const saldoFinanceiro = (nota.valor_total_teto || 0) - totalItens

          return (
            <div 
              key={nota.id} 
              style={{ 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px', 
                padding: '20px', 
                background: nota.status_geral === 'REJEITADA' ? 'var(--bg-error-light)' : 'var(--bg-card)',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
              }}
            >
              {/* CABEÇALHO */}
              <div 
                onClick={() => setNotaSelecionada(nota)}
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}
              >
                <div>
                  <span style={{ fontSize: '0.8em', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>{nota.tipo_documento}</span>
                  <h3 style={{ margin: '5px 0 0 0', color: 'var(--primary-color)' }}>#{nota.numero_ne}</h3>
                  <small style={{ color: 'var(--text-secondary)' }}>Emissor: {nota.emissor}</small>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.85em', fontWeight: 'bold',
                    background: nota.status_geral === 'APROVADA' ? 'var(--bg-success-light)' : 'var(--border-color)',
                    color: nota.status_geral === 'APROVADA' ? 'var(--text-success)' : 'var(--text-primary)'
                  }}>
                    {nota.status_geral}
                  </span>
                  <div style={{ marginTop: '5px', fontSize: '0.85em' }}>
                     Chegada: {nota.data_recebimento ? new Date(nota.data_recebimento).toLocaleDateString() : '-'}
                  </div>
                </div>
              </div>

              {/* INFO FINANCEIRA */}
              <div style={{ background: 'var(--bg-warning-light)', padding: '8px 12px', borderRadius: '6px', fontSize: '0.9em', display: 'flex', gap: '20px', marginBottom: '15px' }}>
                <span><strong>Teto:</strong> {formatarMoeda(nota.valor_total_teto || 0)}</span>
                <span><strong>Total Itens:</strong> {formatarMoeda(totalItens)}</span>
                <span style={{ color: saldoFinanceiro < 0 ? 'red' : 'green' }}>
                  <strong>Saldo:</strong> {formatarMoeda(saldoFinanceiro)}
                </span>
              </div>

              {/* LISTA DE ITENS */}
              <div style={{ fontSize: '0.9em' }}>
                <strong>Itens do Documento:</strong>
                <ul style={{ margin: '10px 0 0 0', padding: 0, listStyle: 'none' }}>
                  {nota.itens?.map((item) => (
                    <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid #f4f4f4' }}>
                      <span>
                        <span style={{ fontWeight: 'bold', color: 'var(--header-text)' }}>{item.quantidade} {item.unidade}</span> - {item.descricao}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
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