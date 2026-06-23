import { useState, useEffect } from 'react'
import './App.css'

const initialTasksHoje = [
  { id: 't1', text: 'Gertrudes — antes da 1ª soneca', who: 'diego' },
  { id: 't2', text: 'Catar cocô da garagem', who: 'rhania' },
  { id: 't3', text: 'Tirar o lixo de casa', who: 'diego' },
]

const tarefasPorCategoria = [
  {
    categoria: 'Gertrudes',
    itens: [
      { id: 'g1', text: 'Rodar todos os dias cedinho', sub: 'Antes da 1ª soneca, com tudo fora do chão', who: 'diego' },
    ],
  },
  {
    categoria: 'Cachorros',
    itens: [
      { id: 'c1', text: 'Catar cocô da garagem', who: 'rhania' },
      { id: 'c2', text: 'Lavar a garagem', who: 'diego' },
      { id: 'c3', text: 'Ração da tarde', who: 'rhania' },
      { id: 'c4', text: 'Ração da noite + remédio', who: 'diego' },
    ],
  },
  {
    categoria: 'Cozinha',
    itens: [
      { id: 'k1', text: 'Manter limpa', sub: 'Rhania ajuda quando dá, responsabilidade é do Diego', who: 'diego' },
      { id: 'k2', text: 'Checar coisas estragadas na geladeira', who: 'rhania' },
    ],
  },
  {
    categoria: 'Lixo',
    itens: [
      { id: 'l1', text: 'Juntar lixo da casa', who: 'rhania' },
      { id: 'l2', text: 'Colocar pra fora', who: 'diego' },
    ],
  },
  {
    categoria: 'Roupa',
    itens: [
      { id: 'r1', text: 'Lavinia, toalhas e lençóis', who: 'rhania' },
      { id: 'r2', text: 'Restante', who: 'diego' },
    ],
  },
  {
    categoria: 'Cata na casa · diário',
    itens: [
      { id: 'cn1', text: 'Consultório e banheiro', who: 'diego' },
      { id: 'cn2', text: 'Sala, quarto da Lavinia, quarto e lavanderia', who: 'rhania' },
    ],
  },
]

const cardapioSemana = [
  { dia: 'Segunda', almoco: 'Carne de panela, feijão, arroz, couve e tomate', jantar: 'Espeto', hoje: true },
  { dia: 'Terça', almoco: 'Bife, arroz, feijão, tomate e couve', jantar: 'Feijoada' },
  { dia: 'Quarta', almoco: 'Strogonoff, arroz, batata palha, tomate', jantar: 'Espeto' },
  { dia: 'Quinta', almoco: 'Bife de frango empanado, arroz, feijão, alface e tomate', jantar: 'Livre' },
  { dia: 'Sexta', almoco: 'Linguiça de frango, arroz, feijão', jantar: 'Espeto' },
  { dia: 'Sábado', almoco: 'Fígado, purê de batata e o que tiver de salada', jantar: 'Lanche' },
  { dia: 'Domingo', almoco: 'Nhoque, carne moída', jantar: 'Livre' },
]

const comprasPorCategoria = [
  {
    categoria: 'Frutas',
    itens: [
      { id: 'f1', text: 'Abacate', qty: '1, pronto' },
      { id: 'f2', text: 'Mamão', qty: '1, pronto' },
      { id: 'f3', text: 'Banana', qty: '4, prontas' },
      { id: 'f4', text: 'Pera' },
      { id: 'f5', text: 'Melancia' },
      { id: 'f6', text: 'Laranja' },
    ],
  },
  {
    categoria: 'Verduras e legumes',
    itens: [
      { id: 'v1', text: 'Tomate', qty: 'pronto' },
      { id: 'v2', text: 'Beterraba', qty: '3, prontas' },
      { id: 'v3', text: 'Vagem' },
      { id: 'v4', text: 'Alface' },
      { id: 'v5', text: 'Batata' },
    ],
  },
  {
    categoria: 'Carnes',
    itens: [
      { id: 'm1', text: 'Bife de vaca' },
      { id: 'm2', text: 'Filé de frango' },
      { id: 'm3', text: 'Linguiça de frango' },
      { id: 'm4', text: 'Fígado' },
      { id: 'm5', text: 'Carne moída' },
    ],
  },
  {
    categoria: 'Padaria e mercado',
    itens: [
      { id: 'p1', text: 'Pão' },
      { id: 'p2', text: 'Sabão OMO' },
      { id: 'p3', text: 'Leite' },
      { id: 'p4', text: 'Batata palha' },
      { id: 'p5', text: 'Suco' },
    ],
  },
]

function Tag({ who }) {
  return <span className={`tag ${who}`}>{who === 'diego' ? 'Diego' : 'Rhania'}</span>
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function App() {
  const [tab, setTab] = useState('hoje')
  const [done, setDone] = useState({})
  const [loading, setLoading] = useState(true)
  const [cardapio, setCardapio] = useState(cardapioSemana)

  // Carregar dados do localStorage quando montar
  useEffect(() => {
    try {
      const saved = localStorage.getItem('casaCiriani_done')
      if (saved) {
        setDone(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Erro ao carregar:', error)
    } finally {
      setLoading(false)
    }
  }, [])
  // Carregar cardápio do localStorage
useEffect(() => {
  try {
    const saved = localStorage.getItem('casaCiriani_cardapio')
    if (saved) {
      setCardapio(JSON.parse(saved))
    }
  } catch (error) {
    console.error('Erro ao carregar cardápio:', error)
  }
}, [])

// Salvar cardápio no localStorage quando mudar
useEffect(() => {
  localStorage.setItem('casaCiriani_cardapio', JSON.stringify(cardapio))
}, [cardapio])

  // Salvar no localStorage quando marcar/desmarcar
  const toggle = (id) => {
    const newState = !done[id]
    const updated = { ...done, [id]: newState }
    setDone(updated)
    localStorage.setItem('casaCiriani_done', JSON.stringify(updated))
  }

  if (loading) {
    return <div className="app"><div className="screens" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Carregando...</div></div>
  }

  return (
    <div className="app">
      <header className="app-header">
        <p className="wordmark">casa ciriani.</p>
        <div className="greeting">
          <h1>Oi, Diego &amp; Rhania</h1>
          <p>Segunda-feira · 23 de junho</p>
        </div>
      </header>

      <main className="screens">
        {tab === 'hoje' && (
          <section>
            <div className="note tilt">
              <span className="tape"></span>
              <p className="note-eyebrow">Cardápio de hoje</p>
              <div className="meal-row">
                <span className="meal-tag">Almoço</span>
                <span className="meal-text">Carne de panela, feijão, arroz, couve e tomate</span>
              </div>
              <div className="meal-row">
                <span className="meal-tag">Jantar</span>
                <span className="meal-text">Espeto</span>
              </div>
            </div>

            <div className="note">
              <p className="note-eyebrow">Tarefas de hoje</p>
              {initialTasksHoje.map((t) => (
                <div key={t.id} className={`task-row ${done[t.id] ? 'done' : ''}`}>
                  <span className={`check ${done[t.id] ? 'checked' : ''}`} onClick={() => toggle(t.id)}>
                    <CheckIcon />
                  </span>
                  <span className="task-text">{t.text}</span>
                  <Tag who={t.who} />
                </div>
              ))}
              <button type="button" className="linklike" onClick={() => setTab('tarefas')}>Ver todas →</button>
            </div>
          </section>
        )}

        {tab === 'cardapio' && (
  <section>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <p className="section-title">Semana</p>
      <button
        type="button"
        className="btn-editar"
        onClick={() => setEditandoCardapio(!editandoCardapio)}
      >
        {editandoCardapio ? '✓ Salvar' : '✎ Editar'}
      </button>
    </div>
    {cardapio.map((d, idx) => (
      <details key={d.dia} className="day" open={d.hoje}>
        <summary>
          {d.dia} {d.hoje && <span className="day-badge">hoje</span>}
          <span className="chev">›</span>
        </summary>
        <div className="day-body">
          <div className="meal-row">
            <span className="meal-tag">Almoço</span>
            {editandoCardapio ? (
              <input
                type="text"
                className="meal-input"
                value={d.almoco}
                onChange={(e) => {
                  const updated = [...cardapio]
                  updated[idx] = { ...updated[idx], almoco: e.target.value }
                  setCardapio(updated)
                }}
              />
            ) : (
              <span className="meal-text">{d.almoco}</span>
            )}
          </div>
          <div className="meal-row">
            <span className="meal-tag">Jantar</span>
            {editandoCardapio ? (
              <input
                type="text"
                className="meal-input"
                value={d.jantar}
                onChange={(e) => {
                  const updated = [...cardapio]
                  updated[idx] = { ...updated[idx], jantar: e.target.value }
                  setCardapio(updated)
                }}
              />
            ) : (
              <span className={`meal-text ${d.jantar === 'Livre' ? 'muted' : ''}`}>{d.jantar}</span>
            )}
          </div>
        </div>
      </details>
    ))}
  </section>
)}

        {tab === 'compras' && (
          <section>
            <div className="note">
              <p className="note-eyebrow">Lista da semana</p>
              {comprasPorCategoria.map((cat) => (
                <div key={cat.categoria}>
                  <p className="section-title">{cat.categoria}</p>
                  {cat.itens.map((item) => (
                    <div key={item.id} className={`shop-row ${done[item.id] ? 'done' : ''}`}>
                      <span className={`check ${done[item.id] ? 'checked' : ''}`} onClick={() => toggle(item.id)}>
                        <CheckIcon />
                      </span>
                      <span className="shop-text">{item.text}</span>
                      {item.qty && <span className="shop-qty">{item.qty}</span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === 'tarefas' && (
          <section>
            {tarefasPorCategoria.map((cat) => (
              <div key={cat.categoria}>
                <p className="section-title">{cat.categoria}</p>
                <div className="note">
                  {cat.itens.map((item) => (
                    <div key={item.id} className={`task-row ${done[item.id] ? 'done' : ''}`}>
                      <span className={`check ${done[item.id] ? 'checked' : ''}`} onClick={() => toggle(item.id)}>
                        <CheckIcon />
                      </span>
                      <span className="task-text">
                        {item.text}
                        {item.sub && <span className="task-sub">{item.sub}</span>}
                      </span>
                      <Tag who={item.who} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </main>

      <nav className="tabbar">
        <button type="button" className={`tab ${tab === 'hoje' ? 'active' : ''}`} onClick={() => setTab('hoje')}>
          <svg viewBox="0 0 24 24"><path d="M4 11.5 12 4l8 7.5" /><path d="M6 10v9h12v-9" /></svg>
          Hoje
        </button>
        <button type="button" className={`tab ${tab === 'cardapio' ? 'active' : ''}`} onClick={() => setTab('cardapio')}>
          <svg viewBox="0 0 24 24"><path d="M4 5c2-1 5-1 7 0v14c-2-1-5-1-7 0V5z" /><path d="M20 5c-2-1-5-1-7 0v14c2-1 5-1 7 0V5z" /></svg>
          Cardápio
        </button>
        <button type="button" className={`tab ${tab === 'compras' ? 'active' : ''}`} onClick={() => setTab('compras')}>
          <svg viewBox="0 0 24 24"><path d="M6 8h12l1 12H5L6 8z" /><path d="M9 8a3 3 0 0 1 6 0" /></svg>
          Compras
        </button>
        <button type="button" className={`tab ${tab === 'tarefas' ? 'active' : ''}`} onClick={() => setTab('tarefas')}>
          <svg viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M8 9h8M8 13h5" /><path d="M8.5 17l1 1 2-2" /></svg>
          Tarefas
        </button>
      </nav>
    </div>
  )
}

export default App