import { Request, Response } from 'express'
import { prisma } from '../db'

export async function getGames(req: Request, res: Response): Promise<void> {
  try {
    const limit = Math.min(parseInt((req.query.limit as string) ?? '20', 10), 100)
    const offset = parseInt((req.query.offset as string) ?? '0', 10)

    const summoner = await prisma.summoner.findFirst()
    if (!summoner) {
      res.json({ games: [], total: 0 })
      return
    }

    const [games, total] = await Promise.all([
      prisma.match.findMany({
        where: { summonerId: summoner.id },
        orderBy: { gameDate: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.match.count({ where: { summonerId: summoner.id } }),
    ])

    const parsed = games.map(g => ({
      ...g,
      augments: JSON.parse(g.augments || '[]') as string[],
      units: JSON.parse(g.units || '[]') as unknown[],
    }))

    res.json({ games: parsed, total })
  } catch (err) {
    console.error('[Controller] getGames error:', err)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
}

export async function getStats(req: Request, res: Response): Promise<void> {
  try {
    const summoner = await prisma.summoner.findFirst()
    if (!summoner) {
      res.json(null)
      return
    }

    const [matches, lpHistory] = await Promise.all([
      prisma.match.findMany({
        where: { summonerId: summoner.id },
        orderBy: { gameDate: 'desc' },
      }),
      prisma.lpSnapshot.findMany({
        where: { summonerId: summoner.id },
        orderBy: { recordedAt: 'asc' },
      }),
    ])

    if (matches.length === 0) {
      res.json(null)
      return
    }

    const avgPlacement = matches.reduce((a, m) => a + m.placement, 0) / matches.length
    const top4Count = matches.filter(m => m.placement <= 4).length
    const winCount = matches.filter(m => m.placement === 1).length
    const latest = matches[0]

    res.json({
      summoner: {
        gameName: summoner.gameName,
        tagLine: summoner.tagLine,
        region: summoner.region,
      },
      totalGames: matches.length,
      avgPlacement: Math.round(avgPlacement * 100) / 100,
      top4Rate: Math.round((top4Count / matches.length) * 100),
      winRate: Math.round((winCount / matches.length) * 100),
      currentTier: latest.tier,
      currentRank: latest.rank,
      currentLp: latest.lpAfter,
      lpHistory: lpHistory.map(s => ({
        lp: s.lp,
        tier: s.tier,
        rank: s.rank,
        recordedAt: s.recordedAt,
      })),
    })
  } catch (err) {
    console.error('[Controller] getStats error:', err)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
}

export async function getSummonerInfo(req: Request, res: Response): Promise<void> {
  try {
    const summoner = await prisma.summoner.findFirst()
    if (!summoner) {
      res.json(null)
      return
    }

    const latestMatch = await prisma.match.findFirst({
      where: { summonerId: summoner.id },
      orderBy: { gameDate: 'desc' },
    })

    res.json({
      gameName: summoner.gameName,
      tagLine: summoner.tagLine,
      region: summoner.region,
      tier: latestMatch?.tier ?? null,
      rank: latestMatch?.rank ?? null,
      lp: latestMatch?.lpAfter ?? null,
    })
  } catch (err) {
    console.error('[Controller] getSummonerInfo error:', err)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
}
