import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function App() {
  // <any[]> avisa que é uma lista de objetos genéricos
  const [notas, setNotas] = useState<any[]>([]) 
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    buscarNotas()
  }, [])

  async function buscarNotas() {
    const { data, error } = await supabase
      .from('notas')
      .select('*')

    if (error) {
      console.error('Erro ao buscar:', error)
      setErro(error.message)
    } else {
      // O símbolo "|| []" garante que se vier nulo, define como lista vazia
      setNotas(data || [])
    }
  }

  return (
    <div style={{ padding: '20px', color: '#333' }}>
      <h1>Teste de Conexão Supabase (TypeScript)</h1>
      
      {erro && <p style={{ color: 'red' }}>Erro: {erro}</p>}

      {notas.length === 0 ? (
        <p>Nenhuma nota encontrada no banco (ou carregando...)</p>
      ) : (
        <ul>
          {notas.map((nota) => (
            <li key={nota.id}>
              {/* O ? evita erro se o campo não existir */}
              NE: {nota.numero_ne} - Status: {nota.status_geral}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App