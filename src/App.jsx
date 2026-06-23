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

const unidades = ['un', 'kg', 'g', 'ml', 'L', 'pacote', 'caixa', 'dúzia']

const comprasIniciais = [
  {
    categoria: 'Frutas',
    itens: [
      { id: 'f1', text: 'Abacate', qtd: 1, unidade: 'un', obs: 'pronto pra uso' },
      { id: 'f2', text: 'Mamão', qtd: 1, unidade: 'un', obs: 'pronto pra uso' },
      { id: 'f3', text: 'Banana', qtd: 4, unidade: 'un', obs: 'prontas pra uso' },
      { id: 'f4', text: 'Pera', qtd: 1, unidade: 'un' },
      { id: 'f5', text: 'Melancia', qtd: 1, unidade: 'un' },
      { id: 'f6', text: 'Laranja', qtd: 1, unidade: 'un' },
    ],
  },
  {
    categoria: 'Verduras e legumes',
    itens: [
      { id: 'v1', text: 'Tomate', qtd: 1, unidade: 'kg', obs: 'pronto pra uso' },
      { id: 'v2', text: 'Beterraba', qtd: 3, unidade: 'un', obs: 'prontas pra uso' },
      { id: 'v3', text: 'Vagem', qtd: 500, unidade: 'g' },
      { id: 'v4', text: 'Alface', qtd: 1, unidade: 'un' },
      { id: 'v5', text: 'Batata', qtd: 1, unidade: 'kg' },
    ],
  },
  {
    categoria: 'Carnes',
    itens: [
      { id: 'm1', text: 'Bife de vaca', qtd: 1, unidade: 'kg' },
      { id: 'm2', text: 'Filé de frango', qtd: 1, unidade: 'kg' },
      { id: 'm3', text: 'Linguiça de frango', qtd: 1, unidade: 'pacote' },
      { id: 'm4', text: 'Fígado', qtd: 1, unidade: 'kg' },
      { id: 'm5', text: 'Carne moída', qtd: 500, unidade: 'g' },
    ],
  },
  {
    categoria: 'Padaria e mercado',
    itens: [
      { id: 'p1', text: 'Pão', qtd: 1, unidade: 'pacote' },
      { id: 'p2', text: 'Sabão OMO', qtd: 1, unidade: 'un' },
      { id: 'p3', text: 'Leite', qtd: 1, unidade: 'L' },
      { id: 'p4', text: 'Batata palha', qtd: 1, unidade: 'pacote' },
      { id: 'p5', text: 'Suco', qtd: 1, unidade: 'L' },
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

function formatQtd(qtd, unidade) {
  if (!qtd && qtd !== 0) return ''
  return `${qtd} ${unidade}`
}

function agruparPorCategoria(itens) {
  const map = {}
  const ordem = []
  itens.forEach((t) => {
    const cat = t.categoria || 'Outras'
    if (!map[cat]) {
      map[cat] = []
      ordem.push(cat)
    }
    map[cat].push(t)
  })
  return ordem.map((cat) => ({ categoria: cat, itens: map[cat] }))
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
  const [novaTarefaCategoria, setNovaTarefaCategoria] = useState('')
  const [mostrarFormFixa, setMostrarFormFixa] = useState(false)
  const [novaFixa, setNovaFixa] = useState('')
  const [novaFixaWho, setNovaFixaWho] = useState('diego')
  const [novaFixaCategoria, setNovaFixaCategoria] = useState('')
  const [mostrarFormCompra, setMostrarFormCompra] = useState(false)
  const [novaCompra, setNovaCompra] = useState('')
  const [novaCompraQtd, setNovaCompraQtd] = useState('')
  const [novaCompraUnidade, setNovaCompraUnidade] = useState('un')
  const [novaCompraObs, setNovaCompraObs] = useState('')
  const [novaCompraCat, setNovaCompraCat] = useState('')
  const [editandoItem, setEditandoItem] = useState(null)
  const [viewTarefas, setViewTarefas] = useState('dia')
  const [diaOffset, setDiaOffset] = useState(0)

  const hojeDiaIdx = getHojeDia()
  const hojeDia = diasSemana[hojeDiaIdx]
  const diaVisivelIdx = (hojeDiaIdx + diaOffset) % 7
  const diaVisivel = diasSemana[diaVisivelIdx]

 function getDiaLabel() {
    if (diaOffset === 0) return 'Hoje'
    return diaVisivel
  }

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
      const savedCompras = localStorage.getItem('casaCiriani_compras2')
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
  useEffect(() => { localStorage.setItem('casaCiriani_compras2', JSON.stringify(compras)) }, [compras])

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
  const adicionarFixa = () => {
    if (!novaFixa.trim()) return
    const id = 'fix_' + Date.now()
    const categoria = novaFixaCategoria.trim() || 'Outras'
    setFixas([...fixas, { id, text: novaFixa.trim(), who: novaFixaWho, categoria }])
    setNovaFixa('')
    setNovaFixaCategoria('')
    setMostrarFormFixa(false)
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
    const categoria = novaTarefaCategoria.trim() || 'Outras'
    const novaLista = [...(tarefasSemana[key] || []), { id, text: novaTarefa.trim(), who: novaTarefaWho, categoria }]
    setTarefasSemana({ ...tarefasSemana, [key]: novaLista })
    setNovaTarefa('')
    setNovaTarefaCategoria('')
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
        return {
          ...cat,
          itens: [...cat.itens, {
            id,
            text: novaCompra.trim(),
            qtd: Number(novaCompraQtd) || 1,
            unidade: novaCompraUnidade,
            obs: novaCompraObs.trim() || undefined,
          }],
        }
      }
      return cat
    })
    setCompras(updated)
    setNovaCompra('')
    setNovaCompraQtd('')
    setNovaCompraUnidade('un')
    setNovaCompraObs('')
    setMostrarFormCompra(false)
  }

  const removerCompra = (catIdx, itemId) => {
    setCompras(compras.map((cat, i) =>
      i === catIdx ? { ...cat, itens: cat.itens.filter((it) => it.id !== itemId) } : cat
    ))
  }

  const salvarEdicao = (catIdx, itemId, campo, valor) => {
    setCompras(compras.map((cat, i) => {
      if (i === catIdx) {
        return {
          ...cat,
          itens: cat.itens.map((it) => {
            if (it.id === itemId) {
              if (campo === 'qtd') return { ...it, qtd: Number(valor) || 0 }
              return { ...it, [campo]: valor }
            }
            return it
          }),
        }
      }
      return cat
    }))
  }

  const hojeCardapio = cardapio[diaVisivelIdx] || cardapio[0]
  const tarefasExtraDia = getTarefasDia(diaVisivel, 0)

  // Categorias sugeridas: as fixas + as já usadas em tarefas extras + algumas padrão
  const categoriasSugeridas = (() => {
    const set = new Set(['Gertrudes', 'Cachorros', 'Cozinha', 'Lixo', 'Roupa', 'Cata na casa', 'Compras', 'Outras'])
    fixas.forEach((t) => set.add(t.categoria))
    Object.values(tarefasSemana).forEach((lista) => lista.forEach((t) => { if (t.categoria) set.add(t.categoria) }))
    return Array.from(set)
  })()

  // Agrupar fixas por categoria (pra tela "Hoje")
  const categoriasFixas = []
  const catMap = {}
  fixas.forEach((t) => {
    if (!catMap[t.categoria]) {
      catMap[t.categoria] = []
      categoriasFixas.push(t.categoria)
    }
    catMap[t.categoria].push(t)
  })

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
            <div className="semana-nav">
              <button type="button" className="semana-btn" onClick={() => setDiaOffset(Math.max(0, diaOffset - 1))}>‹</button>
              <span className="semana-label">{getDiaLabel()}</span>
              <button type="button" className="semana-btn" onClick={() => setDiaOffset(Math.min(6, diaOffset + 1))}>›</button>
            </div>

            <div className="note tilt">
              <span className="tape"></span>
              <p className="note-eyebrow">Cardápio · {diaVisivel}</p>
              <div className="meal-row">
                <span className="meal-tag">Almoço</span>
                <span className="meal-text">{hojeCardapio.almoco}</span>
              </div>
              <div className="meal-row">
                <span className="meal-tag">Jantar</span>
                <span className="meal-text">{hojeCardapio.jantar}</span>
              </div>
            </div>

            {categoriasFixas.map((cat) => (
              <div key={cat}>
                <p className="section-title">{cat}</p>
                <div className="note">
                  {catMap[cat].map((t) => (
                    <div key={t.id} className={`task-row ${done[t.id] ? 'done' : ''}`}>
                      <span className={`check ${done[t.id] ? 'checked' : ''}`} onClick={() => toggle(t.id)}>
                        <CheckIcon />
                      </span>
                      <span className="task-text">{t.text}</span>
                      <span className={`tag ${t.who}`}>{t.who === 'diego' ? 'Diego' : 'Rhania'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {agruparPorCategoria(tarefasExtraDia).map((grupo) => (
              <div key={grupo.categoria}>
                <p className="section-title">{grupo.categoria} · extra</p>
                <div className="note">
                  {grupo.itens.map((t) => (
                    <div key={t.id} className={`task-row ${done[t.id] ? 'done' : ''}`}>
                      <span className={`check ${done[t.id] ? 'checked' : ''}`} onClick={() => toggle(t.id)}>
                        <CheckIcon />
                      </span>
                      <span className="task-text">{t.text}</span>
                      <span className={`tag ${t.who}`}>{t.who === 'diego' ? 'Diego' : 'Rhania'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <p className="section-title" style={{ margin: 0 }}>Lista de compras</p>
              <button type="button" className="btn-editar" onClick={() => setMostrarFormCompra(!mostrarFormCompra)}>
                {mostrarFormCompra ? '✕ Cancelar' : '+ Adicionar'}
              </button>
            </div>

            {mostrarFormCompra && (
              <div className="form-add note">
                <input type="text" className="meal-input" placeholder="Nome do item..." value={novaCompra} onChange={(e) => setNovaCompra(e.target.value)} />
                <div className="compra-qty-row">
                  <input type="number" className="input-qtd" placeholder="Qtd" value={novaCompraQtd} onChange={(e) => setNovaCompraQtd(e.target.value)} />
                  <select className="select-unidade" value={novaCompraUnidade} onChange={(e) => setNovaCompraUnidade(e.target.value)}>
                    {unidades.map((u) => (<option key={u} value={u}>{u}</option>))}
                  </select>
                </div>
                <input type="text" className="meal-input" placeholder="Observação (opcional, ex: pronto pra uso)" value={novaCompraObs} onChange={(e) => setNovaCompraObs(e.target.value)} />
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
                <div className="note">
                  {cat.itens.map((item) => {
                    const isEditing = editandoItem === item.id
                    return (
                      <div key={item.id} className={`shop-item ${done[item.id] ? 'done' : ''}`}>
                        <div className="shop-item-main">
                          <span className={`check ${done[item.id] ? 'checked' : ''}`} onClick={() => toggle(item.id)}>
                            <CheckIcon />
                          </span>
                          <span className="shop-text">{item.text}</span>
                          <span className="shop-badge">{formatQtd(item.qtd, item.unidade)}</span>
                          <span className="btn-edit-item" onClick={() => setEditandoItem(isEditing ? null : item.id)}>
                            {isEditing ? '✓' : '✎'}
                          </span>
                          <span className="btn-remover" onClick={() => removerCompra(catIdx, item.id)}>✕</span>
                        </div>
                        {item.obs && !isEditing && (
                          <p className="shop-obs">{item.obs}</p>
                        )}
                        {isEditing && (
                          <div className="shop-edit-form">
                            <div className="compra-qty-row">
                              <input
                                type="number"
                                className="input-qtd"
                                value={item.qtd}
                                onChange={(e) => salvarEdicao(catIdx, item.id, 'qtd', e.target.value)}
                              />
                              <select
                                className="select-unidade"
                                value={item.unidade}
                                onChange={(e) => salvarEdicao(catIdx, item.id, 'unidade', e.target.value)}
                              >
                                {unidades.map((u) => (<option key={u} value={u}>{u}</option>))}
                              </select>
                            </div>
                            <input
                              type="text"
                              className="meal-input"
                              placeholder="Observação (opcional)"
                              value={item.obs || ''}
                              onChange={(e) => salvarEdicao(catIdx, item.id, 'obs', e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p className="section-title" style={{ margin: 0 }}>Tarefas que se repetem todo dia</p>
                  <button type="button" className="btn-editar" onClick={() => setMostrarFormFixa(!mostrarFormFixa)}>
                    {mostrarFormFixa ? '✕ Cancelar' : '+ Adicionar'}
                  </button>
                </div>

                {mostrarFormFixa && (
                  <div className="form-add note">
                    <input type="text" className="meal-input" placeholder="O que precisa fazer todo dia..." value={novaFixa} onChange={(e) => setNovaFixa(e.target.value)} />
                    <div className="who-picker">
                      <span className={`tag diego ${novaFixaWho === 'diego' ? 'selected' : 'faded'}`} onClick={() => setNovaFixaWho('diego')}>Diego</span>
                      <span className={`tag rhania ${novaFixaWho === 'rhania' ? 'selected' : 'faded'}`} onClick={() => setNovaFixaWho('rhania')}>Rhania</span>
                    </div>
                    <input
                      type="text"
                      className="meal-input"
                      placeholder="Categoria (ex: Cozinha, Cachorros...)"
                      list="categorias-sugeridas-fixa"
                      value={novaFixaCategoria}
                      onChange={(e) => setNovaFixaCategoria(e.target.value)}
                    />
                    <datalist id="categorias-sugeridas-fixa">
                      {categoriasSugeridas.map((c) => (<option key={c} value={c} />))}
                    </datalist>
                    <button type="button" className="btn-confirmar" onClick={adicionarFixa}>Adicionar tarefa fixa</button>
                  </div>
                )}

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
                    <input
                      type="text"
                      className="meal-input"
                      placeholder="Categoria (ex: Cozinha, Compras...)"
                      list="categorias-sugeridas"
                      value={novaTarefaCategoria}
                      onChange={(e) => setNovaTarefaCategoria(e.target.value)}
                    />
                    <datalist id="categorias-sugeridas">
                      {categoriasSugeridas.map((c) => (<option key={c} value={c} />))}
                    </datalist>
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
                        {agruparPorCategoria(tarefasDoDia).map((grupo) => (
                          <div key={grupo.categoria}>
                            <p className="day-subcat">{grupo.categoria}</p>
                            {grupo.itens.map((t) => (
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