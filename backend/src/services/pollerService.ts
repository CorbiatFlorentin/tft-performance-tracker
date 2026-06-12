import { prisma } from '../db'
import * as riot from './riotService'
import { sendGameNotification } from './discordService'

// Convertit tier/rank/LP en LP absolu pour calculer les deltas inter-divisions
function toAbsoluteLP(tier: string, rank: string, lp: number): number {
  const tierBase: Record<string, number> = {
    IRON: 0, BRONZE: 400, SILVER: 800, GOLD: 1200,
    PLATINUM: 1600, EMERALD: 2000, DIAMOND: 2400,
    MASTER: 2800, GRANDMASTER: 2800, CHALLENGER: 2800,
  }
  const rankOffset: Record<string, number> = { IV: 0, III: 100, II: 200, I: 300 }
  const isMasterPlus = ['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(tier.toUpperCase())
  const base = tierBase[tier.toUpperCase()] ?? 0
  const offset = isMasterPlus ? 0 : (rankOffset[rank.toUpperCase()] ?? 0)
  return base + offset + lp
}

export async function initSummoner(gameName: string, tagLine: string, region: string): Promise<string> {
  console.log(`[Poller] Initialisation de ${gameName}#${tagLine} (${region})...`)

  const account = await riot.getAccountByRiotId(gameName, tagLine)
  const summoner = await riot.getSummonerByPuuid(account.puuid)

  let dbSummoner = await prisma.summoner.findUnique({ where: { puuid: account.puuid } })

  if (!dbSummoner) {
    dbSummoner = await prisma.summoner.create({
      data: {
        puuid: account.puuid,
        summonerId: summoner.id,
        gameName: account.gameName,
        tagLine: account.tagLine,
        region,
      },
    })
    console.log(`[Poller] Summoner créé: ${account.gameName}#${account.tagLine}`)
  }

  // Snapshot LP initial
  const leagueEntry = await riot.getLeagueEntry(summoner.id)
  if (leagueEntry) {
    const existing = await prisma.lpSnapshot.count({ where: { summonerId: dbSummoner.id } })
    if (existing === 0) {
      await prisma.lpSnapshot.create({
        data: {
          summonerId: dbSummoner.id,
          lp: leagueEntry.leaguePoints,
          tier: leagueEntry.tier,
          rank: leagueEntry.rank,
        },
      })
      console.log(`[Poller] LP initial: ${leagueEntry.tier} ${leagueEntry.rank} ${leagueEntry.leaguePoints} LP`)
    }
  }

  return dbSummoner.id
}

export async function pollNewGames(summonerId: string): Promise<void> {
  const dbSummoner = await prisma.summoner.findUnique({ where: { id: summonerId } })
  if (!dbSummoner) return

  console.log(`[Poller] Vérification des nouvelles parties classées pour ${dbSummoner.gameName}#${dbSummoner.tagLine}...`)

  const [matchIds, leagueEntry] = await Promise.all([
    riot.getRankedMatchIds(dbSummoner.puuid, 5),
    riot.getLeagueEntry(dbSummoner.summonerId),
  ])

  // Filtrer les matchs déjà enregistrés
  const existing = await prisma.match.findMany({
    where: { summonerId, matchId: { in: matchIds } },
    select: { matchId: true },
  })
  const existingIds = new Set(existing.map(m => m.matchId))
  const newIds = matchIds.filter(id => !existingIds.has(id))

  if (newIds.length === 0) {
    console.log('[Poller] Aucune nouvelle partie classée détectée.')
    return
  }

  console.log(`[Poller] ${newIds.length} nouvelle(s) partie(s) détectée(s)!`)

  // Récupérer le dernier snapshot LP pour calculer le delta
  const prevSnapshot = await prisma.lpSnapshot.findFirst({
    where: { summonerId },
    orderBy: { recordedAt: 'desc' },
  })

  for (const matchId of newIds) {
    try {
      const matchData = await riot.getMatchDetails(matchId)

      // Vérifier queue_id = 1100 (Classé TFT) — normalement déjà filtré par l'API
      if (matchData.info.queue_id !== 1100) {
        console.log(`[Poller] ${matchId} ignoré (queue_id=${matchData.info.queue_id}, pas classé)`)
        continue
      }

      const participant = matchData.info.participants.find(p => p.puuid === dbSummoner.puuid)
      if (!participant) {
        console.log(`[Poller] ${matchId} ignoré (participant non trouvé)`)
        continue
      }

      // Calcul LP delta
      let lpAfter: number | null = null
      let lpBefore: number | null = null
      let lpDelta: number | null = null
      let tier: string | null = null
      let rank: string | null = null

      if (leagueEntry) {
        lpAfter = leagueEntry.leaguePoints
        tier = leagueEntry.tier
        rank = leagueEntry.rank

        if (prevSnapshot) {
          lpBefore = prevSnapshot.lp
          const absNow = toAbsoluteLP(leagueEntry.tier, leagueEntry.rank, leagueEntry.leaguePoints)
          const absPrev = toAbsoluteLP(prevSnapshot.tier, prevSnapshot.rank, prevSnapshot.lp)
          lpDelta = absNow - absPrev
        }
      }

      const match = await prisma.match.create({
        data: {
          matchId,
          summonerId,
          placement: participant.placement,
          level: participant.level,
          timeElapsed: Math.round(matchData.info.game_length),
          gameDate: new Date(matchData.info.game_datetime),
          queueId: matchData.info.queue_id,
          augments: JSON.stringify(participant.augments),
          units: JSON.stringify(participant.units),
          lpBefore,
          lpAfter,
          lpDelta,
          tier,
          rank,
        },
      })

      console.log(`[Poller] ✅ Partie enregistrée: ${matchId} — Placement ${participant.placement}/${8}`)

      await sendGameNotification(match, `${dbSummoner.gameName}#${dbSummoner.tagLine}`)

      await prisma.match.update({
        where: { id: match.id },
        data: { notifiedAt: new Date() },
      })
    } catch (err) {
      console.error(`[Poller] Erreur pour le match ${matchId}:`, err)
    }
  }

  // Enregistrer un nouveau snapshot LP après le traitement
  if (leagueEntry) {
    await prisma.lpSnapshot.create({
      data: {
        summonerId,
        lp: leagueEntry.leaguePoints,
        tier: leagueEntry.tier,
        rank: leagueEntry.rank,
      },
    })
  }
}
