import { config } from '../config'
import type { Match } from '@prisma/client'

const PLACEMENT_COLORS: Record<number, number> = {
  1: 0xFFD700,
  2: 0xC0C0C0,
  3: 0xCD7F32,
  4: 0x22C55E,
  5: 0xFF8C00,
  6: 0xFF4500,
  7: 0xEF4444,
  8: 0x7F1D1D,
}

function ordinal(n: number): string {
  return n === 1 ? '1er' : `${n}ème`
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m${s.toString().padStart(2, '0')}s`
}

function cleanAugmentName(id: string): string {
  return id.replace(/^TFT\d+_Augment_/, '').replace(/([A-Z])/g, ' $1').trim()
}

function formatAugments(augmentsJson: string): string {
  try {
    const augments = JSON.parse(augmentsJson) as string[]
    if (augments.length === 0) return '_Aucun_'
    return augments.map(a => `• ${cleanAugmentName(a)}`).join('\n')
  } catch { return '_Aucun_' }
}

function formatUnits(unitsJson: string): string {
  try {
    const units = JSON.parse(unitsJson) as { character_id: string; tier: number }[]
    if (units.length === 0) return '_N/A_'
    return units
      .sort((a, b) => b.tier - a.tier)
      .slice(0, 8)
      .map(u => `${u.character_id.replace(/^TFT\d+_/, '')} ${'★'.repeat(u.tier)}`)
      .join(', ')
  } catch { return '_N/A_' }
}

function lpLine(match: Match): string {
  const parts: string[] = []
  if (match.tier && match.rank) parts.push(`**${match.tier} ${match.rank}**`)
  if (match.lpAfter !== null) {
    const delta = match.lpDelta
    const deltaStr = delta !== null ? (delta >= 0 ? ` (+${delta} LP)` : ` (${delta} LP)`) : ''
    parts.push(`${match.lpAfter} LP${deltaStr}`)
  }
  return parts.join(' — ') || '_Non classé_'
}

export async function sendGameNotification(match: Match, riotId: string): Promise<void> {
  const url = config.discordWebhookUrl
  if (!url || url.includes('WEBHOOK_ID')) return

  const isWin = match.placement <= 4
  const color = PLACEMENT_COLORS[match.placement] ?? 0x6B7280

  const embed = {
    title: `${isWin ? '✅' : '❌'} Partie Classée TFT — ${ordinal(match.placement)} / 8`,
    color,
    timestamp: match.gameDate.toISOString(),
    fields: [
      {
        name: '📊 Résultat',
        value: [
          `**Placement :** ${ordinal(match.placement)} / 8`,
          `**LP :** ${lpLine(match)}`,
          `**Niveau :** ${match.level}`,
          `**Durée :** ${formatDuration(match.timeElapsed)}`,
        ].join('\n'),
        inline: false,
      },
      {
        name: '🔮 Augments',
        value: formatAugments(match.augments),
        inline: true,
      },
      {
        name: '🎯 Composition',
        value: formatUnits(match.units),
        inline: true,
      },
    ],
    footer: { text: `${riotId} • TFT Ranked Tracker` },
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'TFT Ranked Tracker',
        embeds: [embed],
      }),
    })
    if (!res.ok) {
      const text = await res.text()
      console.error(`[Discord] Erreur ${res.status}: ${text}`)
    } else {
      console.log(`[Discord] Notification envoyée pour ${riotId} — placement ${match.placement}`)
    }
  } catch (err) {
    console.error('[Discord] Impossible d\'envoyer la notification:', err)
  }
}
