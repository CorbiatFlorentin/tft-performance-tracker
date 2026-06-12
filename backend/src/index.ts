import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import { prisma } from './db'
import { config, isConfigured } from './config'
import { initSummoner, pollNewGames } from './services/pollerService'
import gamesRouter from './routes/games'

const app = express()

app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] }))
app.use(express.json())

app.use('/api/games', gamesRouter)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', configured: isConfigured() })
})

let summonerId: string | null = null

async function poll(): Promise<void> {
  if (!summonerId) return
  try {
    await pollNewGames(summonerId)
  } catch (err) {
    console.error('[Poller] Erreur lors du poll:', err)
  }
}

async function main(): Promise<void> {
  await prisma.$connect()
  console.log('[DB] Connexion SQLite établie')

  if (isConfigured()) {
    try {
      summonerId = await initSummoner(config.summonerName, config.summonerTag, config.region)
      await poll()
    } catch (err) {
      console.error('[Init] Impossible d\'initialiser le summoner:', err)
      console.error('[Init] Vérifiez RIOT_API_KEY et SUMMONER_NAME dans le fichier .env')
    }
  } else {
    console.warn('[Config] ⚠️  RIOT_API_KEY ou SUMMONER_NAME non configuré dans .env')
    console.warn('[Config] Le polling est désactivé. Configurez .env pour activer le tracker.')
  }

  // Polling périodique
  const intervalMs = config.pollIntervalMs
  const intervalMin = Math.round(intervalMs / 60000)
  setInterval(poll, intervalMs)
  console.log(`[Poller] Vérification toutes les ${intervalMin} minutes`)

  app.listen(config.port, () => {
    console.log(`[Serveur] ✅ Démarré sur http://localhost:${config.port}`)
    console.log(`[Serveur] Dashboard: http://localhost:3000`)
  })
}

main().catch(err => {
  console.error('[Fatal]', err)
  process.exit(1)
})
