import dotenv from 'dotenv'
dotenv.config()

function routingRegion(region: string): string {
  const map: Record<string, string> = {
    EUW1: 'europe', EUN1: 'europe', TR1: 'europe', RU: 'europe',
    NA1: 'americas', BR1: 'americas', LA1: 'americas', LA2: 'americas',
    KR: 'asia', JP1: 'asia', OC1: 'sea', SG2: 'sea',
  }
  return map[region.toUpperCase()] ?? 'europe'
}

const region = (process.env.REGION ?? 'EUW1').toUpperCase()

export const config = {
  riotApiKey: process.env.RIOT_API_KEY ?? '',
  discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL ?? '',
  summonerName: process.env.SUMMONER_NAME ?? '',
  summonerTag: process.env.SUMMONER_TAG ?? 'EUW',
  region,
  pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS ?? '300000', 10),
  port: parseInt(process.env.PORT ?? '3001', 10),
  platformBaseUrl: `https://${region.toLowerCase()}.api.riotgames.com`,
  regionalBaseUrl: `https://${routingRegion(region)}.api.riotgames.com`,
}

export function isConfigured(): boolean {
  return (
    config.riotApiKey.length > 0 &&
    !config.riotApiKey.includes('xxxxxxxx') &&
    config.summonerName.length > 0 &&
    config.summonerName !== 'VotreNomInGame'
  )
}
