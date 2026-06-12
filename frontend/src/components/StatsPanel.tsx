import type { Stats } from '../utils/api'

const TIER_COLORS: Record<string, string> = {
  IRON: '#a8a29e',
  BRONZE: '#b45309',
  SILVER: '#94a3b8',
  GOLD: '#ca8a04',
  PLATINUM: '#0d9488',
  EMERALD: '#16a34a',
  DIAMOND: '#6366f1',
  MASTER: '#9333ea',
  GRANDMASTER: '#dc2626',
  CHALLENGER: '#0ea5e9',
}

interface StatCardProps {
  label: string
  value: string
  sub?: string
  color?: string
}

function StatCard({ label, value, sub, color }: StatCardProps) {
  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-black" style={{ color: color ?? '#f3f4f6' }}>
        {value}
      </p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  )
}

interface Props {
  stats: Stats
}

export function StatsPanel({ stats }: Props) {
  const tier = stats.currentTier ?? ''
  const tierColor = TIER_COLORS[tier] ?? '#6b7280'
  const rankLabel = tier ? `${tier} ${stats.currentRank ?? ''}` : 'Non classé'

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Rang actuel"
        value={rankLabel}
        sub={stats.currentLp !== null ? `${stats.currentLp} LP` : undefined}
        color={tierColor}
      />
      <StatCard
        label="Parties classées"
        value={String(stats.totalGames)}
        sub="parties enregistrées"
      />
      <StatCard
        label="Placement moyen"
        value={String(stats.avgPlacement)}
        sub={`Top 4 : ${stats.top4Rate}%`}
        color={stats.avgPlacement <= 4 ? '#22c55e' : '#f87171'}
      />
      <StatCard
        label="Taux de victoire"
        value={`${stats.winRate}%`}
        sub="1ères places"
        color="#eab308"
      />
    </div>
  )
}
