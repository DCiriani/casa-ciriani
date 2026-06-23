import { useState, useEffect } from 'react'
import './App.css'

const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

const cardapioInicial = [
  { dia: 'Segunda', almoco: 'Carne de panela, feijão, arroz, couve e tomate', jantar: 'Espeto' },
  { dia: 'Terça', almoco: 'Bife, arroz, feijão, tomate e couve', jantar: 'Feijoada' },
  { dia: 'Quarta', almoco: 'Strogonoff, arroz, batata palha, tomate', jantar: 'Espeto' },
  { dia: 'Quinta', almoco: 'Bife de frango empanado, arroz, feijão, alface e tomate', jantar: 'Livre' },
  { dia: 'Sexta', almoco: 'Linguiça de frango, arroz, feijão', jantar: 'Espeto' },
  { dia: 'Sábado', almoco: 'Fígado, purê de batata e o que tiver de salada', jantar: 'Lanche' },
  { dia: 'Domingo', almoco: 'Nhoque, carne moída', jantar: 'Livre' },
]

const tarefasFixas = [
  { id: 'g1', text: 'Gertrudes — antes da 1ª soneca', who: 'diego', categoria: 'Gertrudes' },
  { id: 'c1', text: 'Catar cocô da garagem', who: 'rhania', categoria: 'Cachorros' },
  { id: 'c2', text: 'Lavar a garagem', who: 'diego', categoria: 'Cachorros' },
  { id: 'c3', text: 'Ração da tarde', who: 'rhania', categoria: 'Cachorros' },
  { id: 'c4', text: 'Ração da noite + remédio', who: 'diego', categoria: 'Cachorros' },
  { id: 'k1', text: 'Cozinha limpa', who: 'diego', categoria: 'Cozinha' },
  { id: 'k2', text: 'Checar geladeira', who: 'rhania', categoria: 'Cozinha' },
  { id: 'l1', text: 'Juntar lixo da casa', who: 'rhania', categoria: 'Lixo' },
  { id: 'l2', text: 'Colocar lixo pra fora', who: 'diego', categoria: 'Lixo' },
  { id: 'r1', text: 'Roupa: Lavinia, toalhas e lençóis', who: 'rhania', categoria: 'Roupa' },
  { id: 'r2', text: 'Roupa: restante', who: 'diego', categoria: 'Roupa' },
  { id: 'cn1', text: 'Cata: consultório e banheiro', who: 'diego', categoria: 'Cata na casa' },
  { id: 'cn2', text: 'Cata: sala, quartos e lavanderia', who: 'rhania', categoria: 'Cata na casa' },
]

const comprasIniciais = [
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

function getHojeDia() {
  const d = new Date()
  const idx = d.getDay()
  return idx === 0 ? 6 : idx - 1
}

function getSemanaLabel(offset) {
  if (offset === 0) return 'Esta semana'
  if (offset === 1) return 'Próxima semana'
  return `Daqui ${offset} semanas`
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
  const [cardapio, setCardapio] = useState(cardapioInicial)
  const [editandoCardapio, setEditandoCardapio] = useState(false)
  const [fixas, setFixas] = useState(tarefasFixas)
  const [tarefasSemana, setTarefasSemana] = useState({})
  const [compras, setCompras] = useState(comprasIniciais)
  const [semanaOffset, setSemanaOffset] = useState(0)
  const [mostrarFormTarefa, setMostrarFormTarefa] = useState(false)
  const [novaTarefa, setNovaTarefa] = useState('')
  const [novaTarefaWho, setNovaTarefaWho] = useState('diego')
  const [novaTarefaDia, setNovaTarefaDia] = useState('')
  const [mostrarFormCompra, setMostrarFormCompra] = useState(false)
  const [novaCompra, setNovaCompra] = useState('')
  const [novaCompraQty, setNovaCompraQty] = useState('')
  const [novaCompraCat, setNovaCompraCat] = useState('')
  const [viewTarefas, setViewTarefas] = useState('dia')

  const hojeDiaIdx = getHojeDia()
  const hojeDia = diasSemana[hojeDiaIdx]

  useEffect(() => {
    try {
      const savedDone = localStorage.getItem('casaCiriani_done')
      if (savedDone) setDone(JSON.parse(savedDone))
      const savedCardapio = localStorage.getItem('casaCiriani_cardapio')
      if (savedCardapio) setCardapio(JSON.parse(savedCardapio))
      const savedFixas = localStorage.getItem('casaCiriani_fixas')
      if (savedFixas) setFixas(JSON.parse(savedFixas))
      const savedSemana = localStorage.getItem('casaCiriani_tarefasSemana')
      if (savedSemana) setTarefasSemana(JSON.parse(savedSemana))
      const savedCompras = localStorage.getItem('casaCiriani_compras')
      if (savedCompras) setCompras(JSON.parse(savedCompras))
    } catch (error) {
      console.error('Erro ao carregar:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { localStorage.setItem('casaCiriani_cardapio', JSON.stringify(cardapio)) }, [cardapio])
  useEffect(() => { localStorage.setItem('casaCiriani_fixas', JSON.stringify(fixas)) }, [fixas])
  useEffect(() => { localStorage.setItem('casaCiriani_tarefasSemana', JSON.stringify(tarefasSemana)) }, [tarefasSemana])
  useEffect(() => { localStorage.setItem('casaCiriani_compras', JSON.stringify(compras)) }, [compras])

  const toggle = (id) => {
    const updated = { ...done, [id]: !done[id] }
    setDone(updated)
    localStorage.setItem('casaCiriani_done', JSON.stringify(updated))
  }

  const toggleFixaWho = (id) => {
    setFixas(fixas.map((t) => t.id === id ? { ...t, who: t.who === 'diego' ? 'rhania' : 'diego' } : t))
  }

  const removerFixa = (id) => {
    setFixas(fixas.filter((t) => t.id !== id))
  }

  const getSemanaKey = (dia, offset) => `sem${offset}_${dia}`

  const getTarefasDia = (dia, offset) => {
    const key = getSemanaKey(dia, offset)
    return tarefasSemana[key] || []
  }

  const adicionarTarefaSemana = () => {
    if (!novaTarefa.trim() || !novaTarefaDia) return
    const key = getSemanaKey(novaTarefaDia, semanaOffset)
    const id = 'ts_' + Date.now()
    const novaLista = [...(tarefasSemana[key] || []), { id, text: novaTarefa.trim(), who: novaTarefaWho }]
    setTarefasSemana({ ...tarefasSemana, [key]: novaLista })
    setNovaTarefa('')
    setMostrarFormTarefa(false)
  }

  const removerTarefaSemana = (dia, offset, itemId) => {
    const key = getSemanaKey(dia, offset)
    const novaLista = (tarefasSemana[key] || []).filter((t) => t.id !== itemId)
    setTarefasSemana({ ...tarefasSemana, [key]: novaLista })
  }

  const toggleTarefaSemanaWho = (dia, offset, itemId) => {
    const key = getSemanaKey(dia, offset)
    const novaLista = (tarefasSemana[key] || []).map((t) =>
      t.id === itemId ? { ...t, who: t.who === 'diego' ? 'rhania' : 'diego' } : t
    )
    setTarefasSemana({ ...tarefasSemana, [key]: novaLista })
  }

  const adicionarCompra = () => {
    if (!novaCompra.trim() || !novaCompraCat) return
    const id = 'shop_' + Date.now()
    const updated = compras.map((cat) => {
      if (cat.categoria === novaCompraCat) {
        return { ...cat, itens: [...cat.itens, { id, text: novaCompra.trim(), qty: novaCompraQty || undefined }] }
      }
      return cat
    })
    setCompras(updated)
    setNovaCompra('')
    setNovaCompraQty('')
    setMostrarFormCompra(false)
  }

  const removerCompra = (catIdx, itemId) => {
    setCompras(compras.map((cat, i) =>
      i === catIdx ? { ...cat, itens: cat.itens.filter((it) => it.id !== itemId) } : cat
    ))
  }

  const hojeCardapio = cardapio[hojeDiaIdx] || cardapio[0]
  const tarefasExtraHoje = getTarefasDia(hojeDia, 0)

  if (loading) {
    return <div className="app"><div className="screens" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Carregando...</div></div>
  }

  return (
    <div className="app">
      <header className="app-header">
        <p className="wordmark">casa ciriani.</p>
        <div className="greeting">
          <h1>Oi, Diego &amp; Rhania</h1>
          <p>{hojeDia}-feira · {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</p>
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
                <span className="meal-text">{hojeCardapio.almoco}</span>
              </div>
              <div className="meal-row">
                <span className="meal-tag">Jantar</span>
                <span className="meal-text">{hojeCardapio.jantar}</span>
              </div>
            </div>

            <div className="note">
              <p className="note-eyebrow">Tarefas fixas de hoje</p>
              {fixas.map((t) => (
                <div key={t.id} className={`task-row ${done[t.id] ? 'done' : ''}`}>
                  <span className={`check ${done[t.id] ? 'checked' : ''}`} onClick={() => toggle(t.id)}>
                    <CheckIcon />
                  </span>
                  <span className="task-text">{t.text}</span>
                  <span className={`tag ${t.who}`}>{t.who === 'diego' ? 'Diego' : 'Rhania'}</span>
                </div>
              ))}
            </div>

            {tarefasExtraHoje.length > 0 && (
              <div className="note">
                <p className="note-eyebrow">Tarefas de hoje ({hojeDia})</p>
                {tarefasExtraHoje.map((t) => (
                  <div key={t.id} className={`task-row ${done[t.id] ? 'done' : ''}`}>
                    <span className={`check ${done[t.id] ? 'checked' : ''}`} onClick={() => toggle(t.id)}>
                      <CheckIcon />
                    </span>
                    <span className="task-text">{t.text}</span>
                    <span className={`tag ${t.who}`}>{t.who === 'diego' ? 'Diego' : 'Rhania'}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === 'cardapio' && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p className="section-title">Semana</p>
              <button type="button" className="btn-editar" onClick={() => setEditandoCardapio(!editandoCardapio)}>
                {editandoCardapio ? '✓ Salvar' : '✎ Editar'}
              </button>
            </div>
            {cardapio.map((d, idx) => (
              <details key={d.dia} className="day" open={idx === hojeDiaIdx}>
                <summary>
                  {d.dia} {idx === hojeDiaIdx && <span className="day-badge">hoje</span>}
                  <span className="chev">›</span>
                </summary>
                <div className="day-body">
                  <div className="meal-row">
                    <span className="meal-tag">Almoço</span>
                    {editandoCardapio ? (
                      <input type="text" className="meal-input" value={d.almoco}
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
                      <input type="text" className="meal-input" value={d.jantar}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p className="note-eyebrow">Lista da semana</p>
                <button type="button" className="btn-editar" onClick={() => setMostrarFormCompra(!mostrarFormCompra)}>
                  {mostrarFormCompra ? '✕ Cancelar' : '+ Adicionar'}
                </button>
              </div>
              {mostrarFormCompra && (
                <div className="form-add">
                  <input type="text" className="meal-input" placeholder="Nome do item..." value={novaCompra} onChange={(e) => setNovaCompra(e.target.value)} />
                  <input type="text" className="meal-input" placeholder="Quantidade (opcional)" value={novaCompraQty} onChange={(e) => setNovaCompraQty(e.target.value)} style={{ marginTop: 8 }} />
                  <select className="select-cat" value={novaCompraCat} onChange={(e) => setNovaCompraCat(e.target.value)}>
                    <option value="">Escolha a categoria...</option>
                    {compras.map((cat) => (<option key={cat.categoria} value={cat.categoria}>{cat.categoria}</option>))}
                  </select>
                  <button type="button" className="btn-confirmar" onClick={adicionarCompra}>Adicionar item</button>
                </div>
              )}
              {compras.map((cat, catIdx) => (
                <div key={cat.categoria}>
                  <p className="section-title">{cat.categoria}</p>
                  {cat.itens.map((item) => (
                    <div key={item.id} className={`shop-row ${done[item.id] ? 'done' : ''}`}>
                      <span className={`check ${done[item.id] ? 'checked' : ''}`} onClick={() => toggle(item.id)}>
                        <CheckIcon />
                      </span>
                      <span className="shop-text">{item.text}</span>
                      {item.qty && <span className="shop-qty">{item.qty}</span>}
                      <span className="btn-remover" onClick={() => removerCompra(catIdx, item.id)}>✕</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === 'tarefas' && (
          <section>
            <div className="view-toggle">
              <button type="button" className={`view-btn ${viewTarefas === 'dia' ? 'active' : ''}`} onClick={() => setViewTarefas('dia')}>Por dia</button>
              <button type="button" className={`view-btn ${viewTarefas === 'fixas' ? 'active' : ''}`} onClick={() => setViewTarefas('fixas')}>Fixas (diárias)</button>
            </div>

            {viewTarefas === 'fixas' && (
              <>
                <p className="section-title">Tarefas que se repetem todo dia</p>
                <div className="note">
                  {fixas.map((t) => (
                    <div key={t.id} className={`task-row ${done[t.id] ? 'done' : ''}`}>
                      <span className={`check ${done[t.id] ? 'checked' : ''}`} onClick={() => toggle(t.id)}>
                        <CheckIcon />
                      </span>
                      <span className="task-text">{t.text}</span>
                      <span className={`tag ${t.who} clickable`} onClick={() => toggleFixaWho(t.id)}>
                        {t.who === 'diego' ? 'Diego' : 'Rhania'}
                      </span>
                      <span className="btn-remover" onClick={() => removerFixa(t.id)}>✕</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {viewTarefas === 'dia' && (
              <>
                <div className="semana-nav">
                  <button type="button" className="semana-btn" onClick={() => setSemanaOffset(Math.max(0, semanaOffset - 1))}>‹</button>
                  <span className="semana-label">{getSemanaLabel(semanaOffset)}</span>
                  <button type="button" className="semana-btn" onClick={() => setSemanaOffset(semanaOffset + 1)}>›</button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                  <button type="button" className="btn-editar" onClick={() => setMostrarFormTarefa(!mostrarFormTarefa)}>
                    {mostrarFormTarefa ? '✕ Cancelar' : '+ Adicionar'}
                  </button>
                </div>

                {mostrarFormTarefa && (
                  <div className="form-add note">
                    <input type="text" className="meal-input" placeholder="O que precisa fazer..." value={novaTarefa} onChange={(e) => setNovaTarefa(e.target.value)} />
                    <div className="who-picker">
                      <span className={`tag diego ${novaTarefaWho === 'diego' ? 'selected' : 'faded'}`} onClick={() => setNovaTarefaWho('diego')}>Diego</span>
                      <span className={`tag rhania ${novaTarefaWho === 'rhania' ? 'selected' : 'faded'}`} onClick={() => setNovaTarefaWho('rhania')}>Rhania</span>
                    </div>
                    <select className="select-cat" value={novaTarefaDia} onChange={(e) => setNovaTarefaDia(e.target.value)}>
                      <option value="">Escolha o dia...</option>
                      {diasSemana.map((d) => (<option key={d} value={d}>{d}</option>))}
                    </select>
                    <button type="button" className="btn-confirmar" onClick={adicionarTarefaSemana}>Adicionar tarefa</button>
                  </div>
                )}

                {diasSemana.map((dia, idx) => {
                  const tarefasDoDia = getTarefasDia(dia, semanaOffset)
                  const isHoje = idx === hojeDiaIdx && semanaOffset === 0
                  return (
                    <details key={dia} className="day" open={isHoje}>
                      <summary>
                        {dia} {isHoje && <span className="day-badge">hoje</span>}
                        {tarefasDoDia.length > 0 && <span className="day-count">{tarefasDoDia.length}</span>}
                        <span className="chev">›</span>
                      </summary>
                      <div className="day-body">
                        {tarefasDoDia.length === 0 && (
                          <p className="empty-msg">Nenhuma tarefa extra pra esse dia</p>
                        )}
                        {tarefasDoDia.map((t) => (
                          <div key={t.id} className={`task-row ${done[t.id] ? 'done' : ''}`}>
                            <span className={`check ${done[t.id] ? 'checked' : ''}`} onClick={() => toggle(t.id)}>
                              <CheckIcon />
                            </span>
                            <span className="task-text">{t.text}</span>
                            <span className={`tag ${t.who} clickable`} onClick={() => toggleTarefaSemanaWho(dia, semanaOffset, t.id)}>
                              {t.who === 'diego' ? 'Diego' : 'Rhania'}
                            </span>
                            <span className="btn-remover" onClick={() => removerTarefaSemana(dia, semanaOffset, t.id)}>✕</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )
                })}
              </>
            )}
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