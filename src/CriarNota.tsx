import { useState } from 'react'
// supabase client usage is handled via helpers to centralize type boundary
import { insertItens, insertAndSelectNota } from './supabaseHelpers'
import type { Database, Tables } from './supabaseTypes'

type Nota = Tables<'notas'>
import { tiposDocumento, apresentacoes } from './utils'

export function CriarNota({ aoSalvar }: { aoSalvar: () => void }) {
  // --- ESTADOS DA CAPA (NOTA) ---
  const [tipoDoc, setTipoDoc] = useState('NOTA DE EMPENHO')
  const [numero, setNumero] = useState('')
  const [emissor, setEmissor] = useState('')
  const [dataEmissao, setDataEmissao] = useState('')
  const [dataChegada, setDataChegada] = useState('')
  const [dataValidade, setDataValidade] = useState('')
  const [valorTeto, setValorTeto] = useState(0)

  // --- ESTADOS DOS ITENS ---
  type NewItem = {
    descricao: string
    quantidade: number
    unidade: string
    valor_unitario: number
  }

  const [itens, setItens] = useState<NewItem[]>([])
  
  // Campos temporários para adicionar um item
  const [descItem, setDescItem] = useState('')
  const [qtdItem, setQtdItem] = useState(1)
  const [unidItem, setUnidItem] = useState('UN')
  const [valorItem, setValorItem] = useState(0)

  const [loading, setLoading] = useState(false)

  // Adiciona item na lista visual (memória)
  function adicionarItem() {
    if (!descItem) return alert('Digite a descrição do item')
    
    setItens([...itens, { 
      descricao: descItem, 
      quantidade: qtdItem, 
      unidade: unidItem, 
      valor_unitario: valorItem 
    }])
    
    // Limpa campos do item
    setDescItem('')
    setQtdItem(1)
    setValorItem(0)
  }

  async function salvarTudo() {
    if (!numero || !dataChegada) return alert('Preencha Número e Data de Chegada!')
    
    setLoading(true)
    try {
      // 1. Inserir a NOTA
        const { data: notaSalva, error: erroNota } = await insertAndSelectNota([{
          numero_ne: numero, 
          emissor: emissor, 
          data_recebimento: dataChegada,
          // Novos Campos
          tipo_documento: tipoDoc,
          data_emissao: dataEmissao || null,
          data_validade: dataValidade || null,
          valor_total_teto: valorTeto
          }] as Database['public']['Tables']['notas']['Insert'][] )
        // insertAndSelect already performs select().single() inside the helper

      const savedNota = notaSalva as Nota | null

      if (erroNota) throw erroNota

      // 2. Preparar itens com o ID da nota
      const itensComId = itens.map(i => ({
        nota_id: savedNota?.id as number | undefined, // Vincula ao pai
        descricao: i.descricao,
        quantidade: i.quantidade,
        unidade: i.unidade,
        valor_unitario: i.valor_unitario
      }))

      // 3. Inserir ITENS
      if (itensComId.length > 0) {
        const { error: erroItens } = await insertItens(itensComId)
        
        if (erroItens) throw erroItens
      }

      alert('Documento salvo com sucesso!')
      
      // Limpar tudo
      setNumero(''); setEmissor(''); setDataChegada(''); setItens([])
      setValorTeto(0); setDataEmissao(''); setDataValidade('')
      
      // Atualizar lista principal
      aoSalvar()

    } catch (error: unknown) {
      // Tratamento seguro do erro sem usar `any` — extrai mensagem quando possível
      const msg = error instanceof Error ? error.message : String(error)
      alert('Erro ao salvar: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px' }}>
      <h2 style={{ marginTop: 0, color: '#2c3e50' }}>📄 Novo Cadastro</h2>

      {/* --- BLOCO 1: DADOS DO DOCUMENTO --- */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold' }}>Tipo Documento</label>
          <select style={{ width: '100%', padding: '8px' }} value={tipoDoc} onChange={e => setTipoDoc(e.target.value)}>
            {tiposDocumento.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold' }}>Número / ID</label>
          <input type="text" style={{ width: '100%', padding: '8px' }} value={numero} onChange={e => setNumero(e.target.value)} placeholder="Ex: 2025/001" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold' }}>Fornecedor / Órgão</label>
          <input type="text" style={{ width: '100%', padding: '8px' }} value={emissor} onChange={e => setEmissor(e.target.value)} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold' }}>Emissão</label>
          <input type="date" style={{ width: '100%', padding: '8px' }} value={dataEmissao} onChange={e => setDataEmissao(e.target.value)} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold' }}>Chegada</label>
          <input type="date" style={{ width: '100%', padding: '8px' }} value={dataChegada} onChange={e => setDataChegada(e.target.value)} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold' }}>Validade</label>
          <input type="date" style={{ width: '100%', padding: '8px' }} value={dataValidade} onChange={e => setDataValidade(e.target.value)} />
        </div>
      </div>

      <div style={{ background: '#e8f8f5', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', color: '#16a085' }}>💰 Valor Teto (Total do Empenho)</label>
        <input 
          type="number" step="0.01" 
          style={{ width: '100%', padding: '8px', fontSize: '1.1em', fontWeight: 'bold', color: '#16a085' }} 
          value={valorTeto} 
          onChange={e => setValorTeto(Number(e.target.value))} 
        />
      </div>

      <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '20px 0' }} />

      {/* --- BLOCO 2: ITENS --- */}
      <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1em' }}>📦 Itens do Pedido</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'end', marginBottom: '10px' }}>
        <div>
          <label style={{ fontSize: '0.8em' }}>Descrição</label>
          <input type="text" style={{ width: '100%', padding: '8px' }} value={descItem} onChange={e => setDescItem(e.target.value)} placeholder="Ex: Dipirona 500mg" />
        </div>
        <div>
          <label style={{ fontSize: '0.8em' }}>Unidade</label>
          <select style={{ width: '100%', padding: '8px' }} value={unidItem} onChange={e => setUnidItem(e.target.value)}>
            {Object.keys(apresentacoes).map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '0.8em' }}>Qtd.</label>
          <input type="number" style={{ width: '100%', padding: '8px' }} value={qtdItem} onChange={e => setQtdItem(Number(e.target.value))} />
        </div>
        <div>
          <label style={{ fontSize: '0.8em' }}>Valor Unit.</label>
          <input type="number" step="0.01" style={{ width: '100%', padding: '8px' }} value={valorItem} onChange={e => setValorItem(Number(e.target.value))} />
        </div>
        <button 
          onClick={adicionarItem}
          style={{ padding: '8px 15px', background: '#34495e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', height: '36px' }}
        >
          + Add
        </button>
      </div>

      {/* Lista Prévia */}
      <div style={{ background: '#f9f9f9', border: '1px solid #eee', borderRadius: '4px', padding: '10px', minHeight: '50px' }}>
        {itens.length === 0 && <span style={{ color: '#aaa', fontStyle: 'italic' }}>Nenhum item adicionado...</span>}
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          {itens.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '5px' }}>
              <strong>{item.quantidade}</strong> {item.unidade} de {item.descricao} 
              <span style={{ color: '#666', fontSize: '0.9em', marginLeft: '10px' }}>
                (Unit: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor_unitario)})
              </span>
            </li>
          ))}
        </ul>
      </div>

      <button 
        onClick={salvarTudo}
        disabled={loading}
        style={{ width: '100%', marginTop: '20px', padding: '12px', background: loading ? '#bdc3c7' : '#27ae60', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1.1em', cursor: 'pointer', fontWeight: 'bold' }}
      >
        {loading ? 'Salvando...' : '💾 SALVAR DOCUMENTO'}
      </button>
    </div>
  )
}