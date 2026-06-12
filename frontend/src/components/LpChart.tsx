'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { Stats } from '../utils/api'

const TIER_BASE: Record<string, number> = {
  IRON: 0, BRONZE: 400, SILVER: 800, GOLD: 1200,
  PLATINUM: 1600, EMERALD: 2000, DIAMOND: 2400,
  MASTER: 2800, GRANDMASTER: 2800, CHALLENGER: 2800,
}
const RANK_OFFSET: Record<string, number> = { IV: 0, III: 100, II: 200, I: 300 }
const MASTER_PLUS = new Set(['MASTER', 'GRANDMASTER', 'CHALLENGER'])

function toAbsoluteLP(tier: string, rank: string, lp: number): number {
  const base = TIER_BASE[tier.toUpperCase()] ?? 0
  const offset = MASTER_PLUS.has(tier.toUpperCase()) ? 0 : (RANK_OFFSET[rank.toUpperCase()] ?? 0)
  return base + offset + lp
}

const TIER_THRESHOLDS = [
  { name: 'CHALLENGER', short: 'C', min: 2800 },
  { name: 'DIAMOND', short: 'D', min: 2400 },
  { name: 'EMERALD', short: 'Em', min: 2000 },
  { name: 'PLATINUM', short: 'Pt', min: 1600 },
  { name: 'GOLD', short: 'Or', min: 1200 },
  { name: 'SILVER', short: 'Ag', min: 800 },
  { name: 'BRONZE', short: 'Br', min: 400 },
  { name: 'IRON', short: 'Fe', min: 0 },
]

function formatAbsoluteLP(absLp: number): string {
  for (const t of TIER_THRESHOLDS) {
    if (absLp >= t.min) {
      if (MASTER_PLUS.has(t.name)) return `${t.short} ${absLp - t.min}LP`
      const divIdx = Math.min(Math.floor((absLp - t.min) / 100), 3)
      const divs = ['IV', 'III', 'II', 'I']
      const lp = absLp - t.min - divIdx * 100
      return `${t.short} ${divs[divIdx]} ${lp}LP`
    }
  }
  return `${absLp}LP`
}

interface TooltipPayload {
  value: number
  payload: { label: string }
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm">
      <p className="text-gray-400">{label}</p>
      <p className="text-indigo-400 font-bold">{formatAbsoluteLP(payload[0].value)}</p>
    </div>
  )
}

interface Props {
  stats: Stats
}

export function LpChart({ stats }: Props) {
  if (stats.lpHistory.length < 2) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6 flex items-center justify-center h-40">
        <p className="text-gray-500 text-sm">Pas encore assez de données pour afficher le graphique.</p>
      </div>
    )
  }

  const data = stats.lpHistory.map(s => ({
    date: new Date(s.recordedAt).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
    }),
    absLp: toAbsoluteLP(s.tier, s.rank, s.lp),
    label: `${s.tier} ${s.rank} — ${s.lp} LP`,
  }))

  // Lignes de référence aux frontières de tiers
  const allAbsLp = data.map(d => d.absLp)
  const minLp = Math.min(...allAbsLp)
  const maxLp = Math.max(...allAbsLp)

  const tierLines = TIER_THRESHOLDS
    .filter(t => t.min >= minLp && t.min <= maxLp && t.min > 0)
    .map(t => ({ value: t.min, label: t.short }))

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 mb-6">
      <h2 className="text-base font-semibold text-gray-200 mb-4">Progression LP</h2>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
          />
          <YAxis
            stroke="#6b7280"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickFormatter={formatAbsoluteLP}
            width={80}
            domain={['auto', 'auto']}
          />
          {tierLines.map(tl => (
            <ReferenceLine
              key={tl.value}
              y={tl.value}
              stroke="#374151"
              strokeDasharray="4 4"
              label={{ value: tl.label, position: 'insideRight', fontSize: 10, fill: '#6b7280' }}
            />
          ))}
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="absLp"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#818cf8' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
