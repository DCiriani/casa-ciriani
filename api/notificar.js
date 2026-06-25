import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'

const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  })
}

const db = getFirestore()

function getHojeDia() {
  const partes = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short' }).format(new Date())
  const map = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }
  return diasSemana[map[partes]]
}

export default async function handler(req, res) {
  const authHeader = req.headers['authorization']
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'unauthorized' })
  }

  try {
    const snap = await db.collection('estado').doc('casa').get()
    if (!snap.exists) return res.status(200).json({ ok: true, pendentes: 0 })

    const data = snap.data()
    const done = data.done || {}
    const fixas = data.fixas || []
    const recorrentes = data.recorrentes || []
    const tarefasSemana = data.tarefasSemana || {}

    const hojeDia = getHojeDia()
    let pendentes = 0

    fixas.forEach((t) => {
      if (!done[`${t.id}_${hojeDia}`]) pendentes++
    })

    recorrentes.forEach((r) => {
      if (r.dias.includes(hojeDia) && !done[`${r.id}_${hojeDia}`]) pendentes++
    })

    const tarefasHoje = tarefasSemana[`sem0_${hojeDia}`] || []
    tarefasHoje.forEach((t) => {
      if (!done[t.id]) pendentes++
    })

    if (pendentes === 0) {
      return res.status(200).json({ ok: true, pendentes: 0, enviado: false })
    }

    const tokensSnap = await db.collection('tokens').get()
    const tokens = tokensSnap.docs.map((d) => d.id)

    if (tokens.length === 0) {
      return res.status(200).json({ ok: true, pendentes, enviado: false, motivo: 'sem tokens cadastrados' })
    }

    const resultado = await getMessaging().sendEachForMulticast({
      notification: {
        title: 'Casa Ciriani',
        body: pendentes === 1 ? 'Tem 1 tarefa pendente hoje.' : `Tem ${pendentes} tarefas pendentes hoje.`,
      },
      webpush: {
        fcmOptions: { link: 'https://casa-ciriani.vercel.app' },
      },
      tokens,
    })

    return res.status(200).json({ ok: true, pendentes, enviado: true, sucesso: resultado.successCount, falhas: resultado.failureCount })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}