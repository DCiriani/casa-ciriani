import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'

// App principal do Casa Ciriani (já existe pelo notificar.js, mas garantimos aqui também)
function getCasaCirianiApp() {
  const existente = getApps().find((a) => a.name === '[DEFAULT]')
  if (existente) return existente
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  })
}

// App secundário, só leitura, do Firestore do consultório
function getConsultorioApp() {
  const existente = getApps().find((a) => a.name === 'consultorio')
  if (existente) return existente
  return initializeApp(
    {
      credential: cert({
        projectId: process.env.CONSULTORIO_FIREBASE_PROJECT_ID,
        clientEmail: process.env.CONSULTORIO_FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.CONSULTORIO_FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      }),
    },
    'consultorio'
  )
}

function getHojeFormatado() {
  // Retorna data de hoje no formato DD/MM/AAAA, no horário de Brasília
  const partes = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(new Date())

  const dia = partes.find((p) => p.type === 'day').value
  const mes = partes.find((p) => p.type === 'month').value
  const ano = partes.find((p) => p.type === 'year').value
  return `${dia}/${mes}/${ano}`
}

export default async function handler(req, res) {
  const authHeader = req.headers['authorization']
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'unauthorized' })
  }

  try {
    const casaApp = getCasaCirianiApp()
    const consultorioApp = getConsultorioApp()

    const dbConsultorio = getFirestore(consultorioApp)
    const dbCasa = getFirestore(casaApp)

    const hoje = getHojeFormatado()

    const snap = await dbConsultorio
      .collection('agenda')
      .where('data', '==', hoje)
      .where('profissional', '==', 'diego')
      .where('tipo', '==', 'sessao')
      .get()

    const atendimentos = snap.docs
      .map((d) => d.data())
      .sort((a, b) => (a.horario || '').localeCompare(b.horario || ''))

    if (atendimentos.length === 0) {
      return res.status(200).json({ ok: true, atendimentos: 0, enviado: false, motivo: 'sem atendimentos hoje' })
    }

    const linhas = atendimentos.map((a) => `${a.horario} - ${a.pacienteNome}`).join('\n')
    const corpo =
      atendimentos.length === 1
        ? `Você tem 1 atendimento hoje:\n${linhas}`
        : `Você tem ${atendimentos.length} atendimentos hoje:\n${linhas}`

    const tokensSnap = await dbCasa.collection('tokens').get()
    const tokens = tokensSnap.docs.map((d) => d.id)

    if (tokens.length === 0) {
      return res.status(200).json({ ok: true, atendimentos: atendimentos.length, enviado: false, motivo: 'sem tokens cadastrados' })
    }

    const resultado = await getMessaging(casaApp).sendEachForMulticast({
      notification: {
        title: 'Agenda de hoje — Espaço Ciriani',
        body: corpo,
      },
      webpush: {
        fcmOptions: { link: 'https://casa-ciriani.vercel.app' },
      },
      tokens,
    })

    return res.status(200).json({
      ok: true,
      atendimentos: atendimentos.length,
      enviado: true,
      sucesso: resultado.successCount,
      falhas: resultado.failureCount,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}
