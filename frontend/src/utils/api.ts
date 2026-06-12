const BASE = '/api/backend'

export interface TftUnit {
  character_id: string
  tier: number
  itemNames?: string[]
}

export interface Game {
  id: string
  matchId: string
  placement: number
  level: number
  timeElapsed: number
  gameDate: string
  augments: string[]
  units: TftUnit[]
  lpBefore: number | null
  lpAfter: number | null
  lpDelta: number | null
  tier: string | null
  rank: string | null
}

export interface LpPoint {
  lp: number
  tier: string
  rank: string
  recordedAt: string
}

export interface Stats {
  summoner: { gameName: string; tagLine: string; region: string }
  totalGames: number
  avgPlacement: number
  top4Rate: number
  winRate: number
  currentTier: string | null
  currentRank: string | null
  currentLp: number | null
  lpHistory: LpPoint[]
}

export async function fetchGames(
  limit = 20,
  offset = 0
): Promise<{ games: Game[]; total: number }> {
  const res = await fetch(`${BASE}/games?limit=${limit}&offset=${offset}`)
  if (!res.ok) throw new Error(`fetchGames: ${res.status}`)
  return res.json()
}

export async function fetchStats(): Promise<Stats | null> {
  const res = await fetch(`${BASE}/games/stats`)
  if (!res.ok) return null
  return res.json()
}
