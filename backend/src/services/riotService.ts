import { config } from '../config'

const HEADERS = { 'X-Riot-Token': config.riotApiKey }

async function riotFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: HEADERS })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Riot API [${res.status}] ${url}: ${text}`)
  }
  return res.json() as Promise<T>
}

export interface RiotAccount {
  puuid: string
  gameName: string
  tagLine: string
}

export interface RiotSummoner {
  puuid: string
  accountId: string
  id: string
  name: string
  profileIconId: number
  summonerLevel: number
}

export interface LeagueEntry {
  queueType: string
  tier: string
  rank: string
  leaguePoints: number
  wins: number
  losses: number
}

export interface TftUnit {
  character_id: string
  tier: number
  itemNames: string[]
}

export interface TftParticipant {
  puuid: string
  placement: number
  level: number
  augments: string[]
  units: TftUnit[]
  time_eliminated: number
  total_damage_to_players: number
}

export interface TftMatchInfo {
  game_datetime: number
  game_length: number
  queue_id: number
  tft_game_type: string
  participants: TftParticipant[]
}

export interface TftMatch {
  metadata: { match_id: string; participants: string[] }
  info: TftMatchInfo
}

export function getAccountByRiotId(gameName: string, tagLine: string): Promise<RiotAccount> {
  const url = `${config.regionalBaseUrl}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
  return riotFetch<RiotAccount>(url)
}

export function getSummonerByPuuid(puuid: string): Promise<RiotSummoner> {
  const url = `${config.platformBaseUrl}/tft/summoner/v1/summoners/by-puuid/${puuid}`
  return riotFetch<RiotSummoner>(url)
}

export async function getLeagueEntry(summonerId: string): Promise<LeagueEntry | null> {
  const url = `${config.platformBaseUrl}/tft/league/v1/entries/by-summoner/${summonerId}`
  const entries = await riotFetch<LeagueEntry[]>(url)
  return entries.find(e => e.queueType === 'RANKED_TFT') ?? null
}

// queue=1100 = Classé TFT Standard uniquement
export function getRankedMatchIds(puuid: string, count = 5): Promise<string[]> {
  const url = `${config.regionalBaseUrl}/tft/match/v1/matches/by-puuid/${puuid}/ids?queue=1100&count=${count}`
  return riotFetch<string[]>(url)
}

export function getMatchDetails(matchId: string): Promise<TftMatch> {
  const url = `${config.regionalBaseUrl}/tft/match/v1/matches/${matchId}`
  return riotFetch<TftMatch>(url)
}
