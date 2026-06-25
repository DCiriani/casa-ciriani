import { useState, useEffect } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { getToken } from 'firebase/messaging'
import { db, auth, getMessagingIfSupported } from './firebase'
import './App.css'

const estadoRef = doc(db, 'estado', 'casa')

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

const tarefasFixasIniciais = [
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

function lerLocalAntigo(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

function App() {
  const [tab, setTab] = useState('hoje')
  const [done, setDone] = useState({})
  const [loading, setLoading] = useState(true)
  const [sincronizado, setSincronizado] = useState(false)
  const [cardapio, setCardapio] = useState(cardapioInicial)
  const [editandoCardapio, setEditandoCardapio] = useState(false)
  const [viewCardapio, setViewCardapio] = useState('padrao')
  const [cardapioSemana, setCardapioSemana] = useState({})
  const [semanaOffsetCardapio, setSemanaOffsetCardapio] = useState(0)
  const [fixas, setFixas] = useState(tarefasFixasIniciais)
  const [tarefasSemana, setTarefasSemana] = useState({})
  const [recorrentes, setRecorrentes] = useState([])
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
  const [mostrarFormRecorrente, setMostrarFormRecorrente] = useState(false)
  const [novaRecorrente, setNovaRecorrente] = useState('')
  const [novaRecorrenteWho, setNovaRecorrenteWho] = useState('diego')
  const [novaRecorrenteCategoria, setNovaRecorrenteCategoria] = useState('')
  const [novaRecorrenteDias, setNovaRecorrenteDias] = useState([])
  const [mostrarFormCompra, setMostrarFormCompra] = useState(false)
  const [novaCompra, setNovaCompra] = useState('')
  const [novaCompraQtd, setNovaCompraQtd] = useState('')
  const [novaCompraUnidade, setNovaCompraUnidade] = useState('un')
  const [novaCompraObs, setNovaCompraObs] = useState('')
  const [novaCompraCat, setNovaCompraCat] = useState('')
  const [editandoItem, setEditandoItem] = useState(null)
  const [viewTarefas, setViewTarefas] = useState('dia')
  const [diaIndexSemana, setDiaIndexSemana] = useState(getHojeDia())
  const [notifStatus, setNotifStatus] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported')
  const [viewCompras, setViewCompras] = useState('geral')
  const [comprasSemana, setComprasSemana] = useState({})
  const [semanaOffsetCompras, setSemanaOffsetCompras] = useState(0)
  const [mostrarFormCompraDia, setMostrarFormCompraDia] = useState(false)
  const [novaCompraDiaTexto, setNovaCompraDiaTexto] = useState('')
  const [novaCompraDiaQtd, setNovaCompraDiaQtd] = useState('')
  const [novaCompraDiaUnidade, setNovaCompraDiaUnidade] = useState('un')
  const [novaCompraDiaObs, setNovaCompraDiaObs] = useState('')
  const [novaCompraDiaDia, setNovaCompraDiaDia] = useState('')

  const hojeDiaIdx = getHojeDia()
  const hojeDia = diasSemana[hojeDiaIdx]
  const diaVisivelIdx = diaIndexSemana
  const diaVisivel = diasSemana[diaVisivelIdx]

  function getDiaLabelAtual() {
    if (semanaOffset === 0 && diaIndexSemana === hojeDiaIdx) return 'Hoje'
    return diaVisivel
  }

  // Login anônimo + escuta em tempo real do documento compartilhado
  useEffect(() => {
    let unsubscribeSnapshot = () => {}

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        try {
          await signInAnonymously(auth)
        } catch (error) {
          console.error('Erro ao entrar:', error)
          setLoading(false)
        }
        return
      }

      unsubscribeSnapshot = onSnapshot(
        estadoRef,
        async (snap) => {
          if (snap.exists()) {
            const data = snap.data()
            if (data.done) setDone(data.done)
            if (data.cardapio) setCardapio(data.cardapio)
            if (data.cardapioSemana) setCardapioSemana(data.cardapioSemana)
            if (data.fixas) setFixas(data.fixas)
            if (data.tarefasSemana) setTarefasSemana(data.tarefasSemana)
            if (data.recorrentes) setRecorrentes(data.recorrentes)
            if (data.compras) setCompras(data.compras)
            if (data.comprasSemana) setComprasSemana(data.comprasSemana)
          } else {
            // primeira vez: usa o que já estava salvo neste celular como ponto de partida
            const inicial = {
              done: lerLocalAntigo('casaCiriani_done', {}),
              cardapio: lerLocalAntigo('casaCiriani_cardapio', cardapioInicial),
              cardapioSemana: {},
              fixas: lerLocalAntigo('casaCiriani_fixas', tarefasFixasIniciais),
              tarefasSemana: lerLocalAntigo('casaCiriani_tarefasSemana', {}),
              recorrentes: lerLocalAntigo('casaCiriani_recorrentes', []),
              compras: lerLocalAntigo('casaCiriani_compras2', comprasIniciais),
              comprasSemana: {},
            }
            try {
              await setDoc(estadoRef, inicial)
            } catch (error) {
              console.error('Erro ao criar estado inicial:', error)
            }
          }
          setSincronizado(true)
          setLoading(false)
        },
        (error) => {
          console.error('Erro ao sincronizar:', error)
          setLoading(false)
        }
      )
    })

    return () => {
      unsubscribeAuth()
      unsubscribeSnapshot()
    }
  }, [])

  const salvarCampo = async (campo, valor) => {
    try {
      await setDoc(estadoRef, { [campo]: valor }, { merge: true })
    } catch (error) {
      console.error('Erro ao salvar:', error)
    }
  }

  const toggle = (id) => {
    const updated = { ...done, [id]: !done[id] }
    setDone(updated)
    salvarCampo('done', updated)
  }

  const toggleFixaWho = (id) => {
    const updated = fixas.map((t) => t.id === id ? { ...t, who: t.who === 'diego' ? 'rhania' : 'diego' } : t)
    setFixas(updated)
    salvarCampo('fixas', updated)
  }

  const removerFixa = (id) => {
    const updated = fixas.filter((t) => t.id !== id)
    setFixas(updated)
    salvarCampo('fixas', updated)
  }

  const adicionarFixa = () => {
    if (!novaFixa.trim()) return
    const id = 'fix_' + Date.now()
    const categoria = novaFixaCategoria.trim() || 'Outras'
    const updated = [...fixas, { id, text: novaFixa.trim(), who: novaFixaWho, categoria }]
    setFixas(updated)
    salvarCampo('fixas', updated)
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
    const updated = { ...tarefasSemana, [key]: novaLista }
    setTarefasSemana(updated)
    salvarCampo('tarefasSemana', updated)
    setNovaTarefa('')
    setNovaTarefaCategoria('')
    setMostrarFormTarefa(false)
  }

  const removerTarefaSemana = (dia, offset, itemId) => {
    const key = getSemanaKey(dia, offset)
    const novaLista = (tarefasSemana[key] || []).filter((t) => t.id !== itemId)
    const updated = { ...tarefasSemana, [key]: novaLista }
    setTarefasSemana(updated)
    salvarCampo('tarefasSemana', updated)
  }

  const toggleTarefaSemanaWho = (dia, offset, itemId) => {
    const key = getSemanaKey(dia, offset)
    const novaLista = (tarefasSemana[key] || []).map((t) =>
      t.id === itemId ? { ...t, who: t.who === 'diego' ? 'rhania' : 'diego' } : t
    )
    const updated = { ...tarefasSemana, [key]: novaLista }
    setTarefasSemana(updated)
    salvarCampo('tarefasSemana', updated)
  }

  const getRecorrentesDia = (dia) => recorrentes.filter((r) => r.dias.includes(dia))

  const getDoneKeyRecorrente = (recorrenteId, dia) => `${recorrenteId}_${dia}`

  const toggleNovaRecorrenteDia = (dia) => {
    setNovaRecorrenteDias((prev) => prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia])
  }

  const adicionarRecorrente = () => {
    if (!novaRecorrente.trim() || novaRecorrenteDias.length === 0) return
    const id = 'rec_' + Date.now()
    const categoria = novaRecorrenteCategoria.trim() || 'Outras'
    const updated = [...recorrentes, { id, text: novaRecorrente.trim(), who: novaRecorrenteWho, categoria, dias: novaRecorrenteDias }]
    setRecorrentes(updated)
    salvarCampo('recorrentes', updated)
    setNovaRecorrente('')
    setNovaRecorrenteCategoria('')
    setNovaRecorrenteDias([])
    setMostrarFormRecorrente(false)
  }

  const removerRecorrente = (id) => {
    const updated = recorrentes.filter((r) => r.id !== id)
    setRecorrentes(updated)
    salvarCampo('recorrentes', updated)
  }

  const toggleRecorrenteWho = (id) => {
    const updated = recorrentes.map((r) => r.id === id ? { ...r, who: r.who === 'diego' ? 'rhania' : 'diego' } : r)
    setRecorrentes(updated)
    salvarCampo('recorrentes', updated)
  }

  const toggleRecorrenteDia = (id, dia) => {
    const updated = recorrentes.map((r) => {
      if (r.id !== id) return r
      const dias = r.dias.includes(dia) ? r.dias.filter((d) => d !== dia) : [...r.dias, dia]
      return { ...r, dias }
    })
    setRecorrentes(updated)
    salvarCampo('recorrentes', updated)
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
    salvarCampo('compras', updated)
    setNovaCompra('')
    setNovaCompraQtd('')
    setNovaCompraUnidade('un')
    setNovaCompraObs('')
    setMostrarFormCompra(false)
  }

  const removerCompra = (catIdx, itemId) => {
    const updated = compras.map((cat, i) =>
      i === catIdx ? { ...cat, itens: cat.itens.filter((it) => it.id !== itemId) } : cat
    )
    setCompras(updated)
    salvarCampo('compras', updated)
  }

  const salvarEdicao = (catIdx, itemId, campo, valor) => {
    const updated = compras.map((cat, i) => {
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
    })
    setCompras(updated)
    salvarCampo('compras', updated)
  }

  const getComprasSemanaKey = (dia, offset) => `csem${offset}_${dia}`

  const getComprasDia = (dia, offset) => {
    const key = getComprasSemanaKey(dia, offset)
    return comprasSemana[key] || []
  }

  const adicionarCompraDia = () => {
    if (!novaCompraDiaTexto.trim() || !novaCompraDiaDia) return
    const key = getComprasSemanaKey(novaCompraDiaDia, semanaOffsetCompras)
    const id = 'cs_' + Date.now()
    const novaLista = [...(comprasSemana[key] || []), {
      id,
      text: novaCompraDiaTexto.trim(),
      qtd: Number(novaCompraDiaQtd) || 1,
      unidade: novaCompraDiaUnidade,
      obs: novaCompraDiaObs.trim() || undefined,
    }]
    const updated = { ...comprasSemana, [key]: novaLista }
    setComprasSemana(updated)
    salvarCampo('comprasSemana', updated)
    setNovaCompraDiaTexto('')
    setNovaCompraDiaQtd('')
    setNovaCompraDiaUnidade('un')
    setNovaCompraDiaObs('')
    setMostrarFormCompraDia(false)
  }

  const removerCompraDia = (dia, offset, itemId) => {
    const key = getComprasSemanaKey(dia, offset)
    const novaLista = (comprasSemana[key] || []).filter((it) => it.id !== itemId)
    const updated = { ...comprasSemana, [key]: novaLista }
    setComprasSemana(updated)
    salvarCampo('comprasSemana', updated)
  }

  const editarCardapio = (idx, campo, valor) => {
    const updated = [...cardapio]
    updated[idx] = { ...updated[idx], [campo]: valor }
    setCardapio(updated)
    salvarCampo('cardapio', updated)
  }

  const getCardapioSemanaKey = (dia, offset) => `csem${offset}_${dia}`

  const getCardapioDoDia = (dia, offset) => {
    const key = getCardapioSemanaKey(dia, offset)
    if (cardapioSemana[key]) return cardapioSemana[key]
    const padrao = cardapio.find((c) => c.dia === dia)
    return padrao || { almoco: '', jantar: '' }
  }

  const editarCardapioSemana = (dia, offset, campo, valor) => {
    const key = getCardapioSemanaKey(dia, offset)
    const atual = cardapioSemana[key] || getCardapioDoDia(dia, offset)
    const atualizado = { ...atual, [campo]: valor }
    const updated = { ...cardapioSemana, [key]: atualizado }
    setCardapioSemana(updated)
    salvarCampo('cardapioSemana', updated)
  }

  const restaurarCardapioPadrao = (dia, offset) => {
    const key = getCardapioSemanaKey(dia, offset)
    const updated = { ...cardapioSemana }
    delete updated[key]
    setCardapioSemana(updated)
    salvarCampo('cardapioSemana', updated)
  }

  const ativarNotificacoes = async () => {
    try {
      if (Notification.permission === 'denied') {
        alert('As notificações estão bloqueadas pra esse app. Vá nas configurações do navegador/celular e permita notificações pro Casa Ciriani manualmente, depois recarregue a página.')
        return
      }

      const permissao = await Notification.requestPermission()
      setNotifStatus(permissao)
      if (permissao !== 'granted') {
        alert('Permissão não concedida: ' + permissao)
        return
      }

      const messaging = await getMessagingIfSupported()
      if (!messaging) {
        alert('Esse navegador não suporta notificações.')
        return
      }

      const registration = await navigator.serviceWorker.ready
      const token = await getToken(messaging, {
        vapidKey: 'BChvt77hYyOr3HV5-b23aW-6T-iqsNQt6NZOA5K5yHOT7aGqNTYJvz8s6jrfRkZkJM4V8kgSlgmeKPumfNQLFXo',
        serviceWorkerRegistration: registration,
      })

      if (token) {
        await setDoc(doc(db, 'tokens', token), { criadoEm: Date.now() })
        alert('Notificações ativadas com sucesso!')
      } else {
        alert('Não foi possível gerar o código de notificação (token vazio).')
      }
    } catch (error) {
      console.error('Erro ao ativar notificações:', error)
      alert('Erro ao ativar notificações: ' + error.message)
    }
  }

  const hojeCardapio = getCardapioDoDia(diaVisivel, semanaOffset)
  const tarefasExtraDia = getTarefasDia(diaVisivel, semanaOffset)
  const recorrentesDoDia = getRecorrentesDia(diaVisivel)

  const categoriasSugeridas = (() => {
    const set = new Set(['Gertrudes', 'Cachorros', 'Cozinha', 'Lixo', 'Roupa', 'Cata na casa', 'Compras', 'Outras'])
    fixas.forEach((t) => set.add(t.categoria))
    Object.values(tarefasSemana).forEach((lista) => lista.forEach((t) => { if (t.categoria) set.add(t.categoria) }))
    recorrentes.forEach((r) => set.add(r.categoria))
    return Array.from(set)
  })()

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
    return <div className="app"><div className="screens" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Sincronizando...</div></div>
  }

  return (
    <div className="app">
      <header className="app-header">
        <p className="wordmark">casa ciriani. {sincronizado && <span className="sync-dot" title="Sincronizado"></span>}</p>
        <div className="greeting">
          <h1>Oi, Diego &amp; Rhania</h1>
          <p>{hojeDia}-feira · {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</p>
        </div>
        {notifStatus !== 'granted' && notifStatus !== 'unsupported' && (
          <button type="button" className="btn-editar" onClick={ativarNotificacoes} style={{ marginTop: 8 }}>
            🔔 Ativar avisos de tarefas pendentes
          </button>
        )}
      </header>

      <main className="screens">

        {tab === 'hoje' && (
          <section>
            <div className="semana-nav">
              <button type="button" className="semana-btn" onClick={() => {
                const novo = Math.max(0, semanaOffset - 1)
                setSemanaOffset(novo)
                setDiaIndexSemana(novo === 0 ? hojeDiaIdx : 0)
              }}>«</button>
              <span className="semana-label">{getSemanaLabel(semanaOffset)}</span>
              <button type="button" className="semana-btn" onClick={() => {
                setSemanaOffset(semanaOffset + 1)
                setDiaIndexSemana(0)
              }}>»</button>
            </div>

            <div className="semana-nav">
              <button type="button" className="semana-btn" onClick={() => setDiaIndexSemana(Math.max(0, diaIndexSemana - 1))}>‹</button>
              <span className="semana-label">{getDiaLabelAtual()}</span>
              <button type="button" className="semana-btn" onClick={() => setDiaIndexSemana(Math.min(6, diaIndexSemana + 1))}>›</button>
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
                  {catMap[cat].map((t) => {
                    const doneKey = getDoneKeyRecorrente(t.id, diaVisivel)
                    return (
                    <div key={t.id} className={`task-row ${done[doneKey] ? 'done' : ''}`}>
                      <span className={`check ${done[doneKey] ? 'checked' : ''}`} onClick={() => toggle(doneKey)}>
                        <CheckIcon />
                      </span>
                      <span className="task-text">{t.text}</span>
                      <span className={`tag ${t.who} clickable`} onClick={() => toggleFixaWho(t.id)}>
                        {t.who === 'diego' ? 'Diego' : 'Rhania'}
                      </span>
                    </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {agruparPorCategoria(recorrentesDoDia).map((grupo) => (
              <div key={'rec_' + grupo.categoria}>
                <p className="section-title">{grupo.categoria} · fixo da semana</p>
                <div className="note">
                  {grupo.itens.map((t) => {
                    const doneKey = getDoneKeyRecorrente(t.id, diaVisivel)
                    return (
                    <div key={doneKey} className={`task-row ${done[doneKey] ? 'done' : ''}`}>
                      <span className={`check ${done[doneKey] ? 'checked' : ''}`} onClick={() => toggle(doneKey)}>
                        <CheckIcon />
                      </span>
                      <span className="task-text">{t.text}</span>
                      <span className={`tag ${t.who} clickable`} onClick={() => toggleRecorrenteWho(t.id)}>
                        {t.who === 'diego' ? 'Diego' : 'Rhania'}
                      </span>
                    </div>
                    )
                  })}
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
                      <span className={`tag ${t.who} clickable`} onClick={() => toggleTarefaSemanaWho(diaVisivel, semanaOffset, t.id)}>
                        {t.who === 'diego' ? 'Diego' : 'Rhania'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {tab === 'cardapio' && (
          <section>
            <div className="view-toggle">
              <button type="button" className={`view-btn ${viewCardapio === 'padrao' ? 'active' : ''}`} onClick={() => setViewCardapio('padrao')}>Padrão</button>
              <button type="button" className={`view-btn ${viewCardapio === 'semana' ? 'active' : ''}`} onClick={() => setViewCardapio('semana')}>Por semana</button>
            </div>

            {viewCardapio === 'padrao' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p className="section-title">Cardápio padrão (repete toda semana)</p>
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
                            onChange={(e) => editarCardapio(idx, 'almoco', e.target.value)}
                          />
                        ) : (
                          <span className="meal-text">{d.almoco}</span>
                        )}
                      </div>
                      <div className="meal-row">
                        <span className="meal-tag">Jantar</span>
                        {editandoCardapio ? (
                          <input type="text" className="meal-input" value={d.jantar}
                            onChange={(e) => editarCardapio(idx, 'jantar', e.target.value)}
                          />
                        ) : (
                          <span className={`meal-text ${d.jantar === 'Livre' ? 'muted' : ''}`}>{d.jantar}</span>
                        )}
                      </div>
                    </div>
                  </details>
                ))}
              </>
            )}

            {viewCardapio === 'semana' && (
              <>
                <div className="semana-nav">
                  <button type="button" className="semana-btn" onClick={() => setSemanaOffsetCardapio(Math.max(0, semanaOffsetCardapio - 1))}>‹</button>
                  <span className="semana-label">{getSemanaLabel(semanaOffsetCardapio)}</span>
                  <button type="button" className="semana-btn" onClick={() => setSemanaOffsetCardapio(semanaOffsetCardapio + 1)}>›</button>
                </div>
                <p className="empty-msg" style={{ marginTop: 4 }}>Edita só essa semana, sem mudar o cardápio padrão.</p>

                {diasSemana.map((dia, idx) => {
                  const key = getCardapioSemanaKey(dia, semanaOffsetCardapio)
                  const temOverride = !!cardapioSemana[key]
                  const valorDia = getCardapioDoDia(dia, semanaOffsetCardapio)
                  const isHoje = idx === hojeDiaIdx && semanaOffsetCardapio === 0
                  return (
                    <details key={dia} className="day" open={isHoje}>
                      <summary>
                        {dia} {isHoje && <span className="day-badge">hoje</span>}
                        {temOverride && <span className="day-badge">editado</span>}
                        <span className="chev">›</span>
                      </summary>
                      <div className="day-body">
                        <div className="meal-row">
                          <span className="meal-tag">Almoço</span>
                          <input type="text" className="meal-input" value={valorDia.almoco}
                            onChange={(e) => editarCardapioSemana(dia, semanaOffsetCardapio, 'almoco', e.target.value)}
                          />
                        </div>
                        <div className="meal-row">
                          <span className="meal-tag">Jantar</span>
                          <input type="text" className="meal-input" value={valorDia.jantar}
                            onChange={(e) => editarCardapioSemana(dia, semanaOffsetCardapio, 'jantar', e.target.value)}
                          />
                        </div>
                        {temOverride && (
                          <p className="linklike" onClick={() => restaurarCardapioPadrao(dia, semanaOffsetCardapio)}>↺ Restaurar cardápio padrão desse dia</p>
                        )}
                      </div>
                    </details>
                  )
                })}
              </>
            )}
          </section>
        )}

        {tab === 'compras' && (
          <section>
            <div className="view-toggle">
              <button type="button" className={`view-btn ${viewCompras === 'geral' ? 'active' : ''}`} onClick={() => setViewCompras('geral')}>Lista geral</button>
              <button type="button" className={`view-btn ${viewCompras === 'dia' ? 'active' : ''}`} onClick={() => setViewCompras('dia')}>Por dia da semana</button>
            </div>

            {viewCompras === 'geral' && (
              <>
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
              </>
            )}

            {viewCompras === 'dia' && (
              <>
                <div className="semana-nav">
                  <button type="button" className="semana-btn" onClick={() => setSemanaOffsetCompras(Math.max(0, semanaOffsetCompras - 1))}>‹</button>
                  <span className="semana-label">{getSemanaLabel(semanaOffsetCompras)}</span>
                  <button type="button" className="semana-btn" onClick={() => setSemanaOffsetCompras(semanaOffsetCompras + 1)}>›</button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                  <button type="button" className="btn-editar" onClick={() => setMostrarFormCompraDia(!mostrarFormCompraDia)}>
                    {mostrarFormCompraDia ? '✕ Cancelar' : '+ Adicionar'}
                  </button>
                </div>

                {mostrarFormCompraDia && (
                  <div className="form-add note">
                    <input type="text" className="meal-input" placeholder="Nome do item..." value={novaCompraDiaTexto} onChange={(e) => setNovaCompraDiaTexto(e.target.value)} />
                    <div className="compra-qty-row">
                      <input type="number" className="input-qtd" placeholder="Qtd" value={novaCompraDiaQtd} onChange={(e) => setNovaCompraDiaQtd(e.target.value)} />
                      <select className="select-unidade" value={novaCompraDiaUnidade} onChange={(e) => setNovaCompraDiaUnidade(e.target.value)}>
                        {unidades.map((u) => (<option key={u} value={u}>{u}</option>))}
                      </select>
                    </div>
                    <input type="text" className="meal-input" placeholder="Observação (opcional)" value={novaCompraDiaObs} onChange={(e) => setNovaCompraDiaObs(e.target.value)} />
                    <select className="select-cat" value={novaCompraDiaDia} onChange={(e) => setNovaCompraDiaDia(e.target.value)}>
                      <option value="">Escolha o dia...</option>
                      {diasSemana.map((d) => (<option key={d} value={d}>{d}</option>))}
                    </select>
                    <button type="button" className="btn-confirmar" onClick={adicionarCompraDia}>Adicionar compra</button>
                  </div>
                )}

                {diasSemana.map((dia, idx) => {
                  const itensDoDia = getComprasDia(dia, semanaOffsetCompras)
                  const isHoje = idx === hojeDiaIdx && semanaOffsetCompras === 0
                  return (
                    <details key={dia} className="day" open={isHoje}>
                      <summary>
                        {dia} {isHoje && <span className="day-badge">hoje</span>}
                        {itensDoDia.length > 0 && <span className="day-count">{itensDoDia.length}</span>}
                        <span className="chev">›</span>
                      </summary>
                      <div className="day-body">
                        {itensDoDia.length === 0 && (
                          <p className="empty-msg">Nenhuma compra agendada pra esse dia</p>
                        )}
                        {itensDoDia.map((item) => (
                          <div key={item.id} className={`shop-item ${done[item.id] ? 'done' : ''}`}>
                            <div className="shop-item-main">
                              <span className={`check ${done[item.id] ? 'checked' : ''}`} onClick={() => toggle(item.id)}>
                                <CheckIcon />
                              </span>
                              <span className="shop-text">{item.text}</span>
                              <span className="shop-badge">{formatQtd(item.qtd, item.unidade)}</span>
                              <span className="btn-remover" onClick={() => removerCompraDia(dia, semanaOffsetCompras, item.id)}>✕</span>
                            </div>
                            {item.obs && (<p className="shop-obs">{item.obs}</p>)}
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

        {tab === 'tarefas' && (
          <section>
            <div className="view-toggle">
              <button type="button" className={`view-btn ${viewTarefas === 'dia' ? 'active' : ''}`} onClick={() => setViewTarefas('dia')}>Por dia</button>
              <button type="button" className={`view-btn ${viewTarefas === 'fixas' ? 'active' : ''}`} onClick={() => setViewTarefas('fixas')}>Fixas diárias</button>
              <button type="button" className={`view-btn ${viewTarefas === 'recorrentes' ? 'active' : ''}`} onClick={() => setViewTarefas('recorrentes')}>Fixas da semana</button>
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
                  {fixas.map((t) => {
                    const doneKey = getDoneKeyRecorrente(t.id, hojeDia)
                    return (
                    <div key={t.id} className={`task-row ${done[doneKey] ? 'done' : ''}`}>
                      <span className={`check ${done[doneKey] ? 'checked' : ''}`} onClick={() => toggle(doneKey)}>
                        <CheckIcon />
                      </span>
                      <span className="task-text">{t.text}</span>
                      <span className={`tag ${t.who} clickable`} onClick={() => toggleFixaWho(t.id)}>
                        {t.who === 'diego' ? 'Diego' : 'Rhania'}
                      </span>
                      <span className="btn-remover" onClick={() => removerFixa(t.id)}>✕</span>
                    </div>
                    )
                  })}
                </div>
              </>
            )}

            {viewTarefas === 'recorrentes' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p className="section-title" style={{ margin: 0 }}>Fixas em dias específicos</p>
                  <button type="button" className="btn-editar" onClick={() => setMostrarFormRecorrente(!mostrarFormRecorrente)}>
                    {mostrarFormRecorrente ? '✕ Cancelar' : '+ Adicionar'}
                  </button>
                </div>
                <p className="empty-msg" style={{ marginTop: 4 }}>Ex: "dia do lixeiro" toda Segunda e Quarta</p>

                {mostrarFormRecorrente && (
                  <div className="form-add note">
                    <input type="text" className="meal-input" placeholder="O que precisa fazer..." value={novaRecorrente} onChange={(e) => setNovaRecorrente(e.target.value)} />
                    <div className="who-picker">
                      <span className={`tag diego ${novaRecorrenteWho === 'diego' ? 'selected' : 'faded'}`} onClick={() => setNovaRecorrenteWho('diego')}>Diego</span>
                      <span className={`tag rhania ${novaRecorrenteWho === 'rhania' ? 'selected' : 'faded'}`} onClick={() => setNovaRecorrenteWho('rhania')}>Rhania</span>
                    </div>
                    <input
                      type="text"
                      className="meal-input"
                      placeholder="Categoria (ex: Lixo, Cozinha...)"
                      list="categorias-sugeridas-rec"
                      value={novaRecorrenteCategoria}
                      onChange={(e) => setNovaRecorrenteCategoria(e.target.value)}
                    />
                    <datalist id="categorias-sugeridas-rec">
                      {categoriasSugeridas.map((c) => (<option key={c} value={c} />))}
                    </datalist>
                    <p className="empty-msg" style={{ margin: '4px 0 0' }}>Em quais dias se repete:</p>
                    <div className="dia-chips-row">
                      {diasSemana.map((d) => (
                        <span
                          key={d}
                          className={`dia-chip ${novaRecorrenteDias.includes(d) ? 'selected' : ''}`}
                          onClick={() => toggleNovaRecorrenteDia(d)}
                        >
                          {d.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                    <button type="button" className="btn-confirmar" onClick={adicionarRecorrente}>Adicionar tarefa fixa da semana</button>
                  </div>
                )}

                {recorrentes.length === 0 && (
                  <p className="empty-msg">Nenhuma tarefa fixa por dia da semana ainda</p>
                )}

                <div className="note">
                  {recorrentes.map((r) => (
                    <div key={r.id} className="recorrente-item">
                      <div className="recorrente-main">
                        <span className={`check ${done[r.id] ? 'checked' : ''}`} onClick={() => toggle(r.id)}>
                          <CheckIcon />
                        </span>
                        <span className="task-text">{r.text}</span>
                        <span className={`tag ${r.who} clickable`} onClick={() => toggleRecorrenteWho(r.id)}>
                          {r.who === 'diego' ? 'Diego' : 'Rhania'}
                        </span>
                        <span className="btn-remover" onClick={() => removerRecorrente(r.id)}>✕</span>
                      </div>
                      <div className="recorrente-dias">
                        {diasSemana.map((d) => (
                          <span
                            key={d}
                            className={`dia-chip small ${r.dias.includes(d) ? 'selected' : ''}`}
                            onClick={() => toggleRecorrenteDia(r.id, d)}
                          >
                            {d.slice(0, 3)}
                          </span>
                        ))}
                      </div>
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