import type { Game } from '../utils/api'

const PLACEMENT_STYLES: Record<
  number,
  { ring: string; text: string; badge: string }
> = {
  1: { ring: 'border-yellow-500/60',  text: 'text-yellow-400',  badge: 'bg-yellow-500/20 text-yellow-300' },
  2: { ring: 'border-slate-400/60',   text: 'text-slate-300',   badge: 'bg-slate-400/20 text-slate-300'  },
  3: { ring: 'border-amber-600/60',   text: 'text-amber-500',   badge: 'bg-amber-600/20 text-amber-400'  },
  4: { ring: 'border-green-500/50',   text: 'text-green-400',   badge: 'bg-green-500/20 text-green-300'  },
}

function placementStyle(n: number) {
  return PLACEMENT_STYLES[n] ?? {
    ring: 'border-red-500/30',
    text: 'text-red-400',
    badge: 'bg-red-500/10 text-red-400',
  }
}

function ordinal(n: number): string {
  return n === 1 ? '1er' : `${n}ème`
}

function formatDuration(s: number): string {
  return `${Math.floor(s / 60)}m${(s % 60).toString().padStart(2, '0')}s`
}

function cleanAugment(id: string): string {
  return id
    .replace(/^TFT\d+_Augment_/, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim()
}

function cleanUnit(id: string): string {
  return id.replace(/^TFT\d+_/, '')
}

interface Props {
  game: Game
}

export function GameCard({ game }: Props) {
  const style = placementStyle(game.placement)
  const isTop4 = game.placement <= 4
  const date = new Date(game.gameDate).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const topUnits = [...game.units]
    .sort((a, b) => b.tier - a.tier)
    .slice(0, 8)

  return (
    <div
      className={`
        rounded-xl border p-4 mb-3
        bg-gray-800/60
        ${style.ring}
        transition-all hover:bg-gray-800
      `}
    >
      <div className="flex items-start gap-4">
        {/* Placement badge */}
        <div className="flex flex-col items-center min-w-[56px] shrink-0">
          <span className={`text-2xl font-black leading-tight ${style.text}`}>
            {ordinal(game.placement)}
          </span>
          <span className="text-gray-500 text-[10px] mt-0.5">
            {isTop4 ? '✓ Top 4' : '✗ Bot 4'}
          </span>
          <span className="text-gray-600 text-[10px] mt-1">
            {formatDuration(game.timeElapsed)}
          </span>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header: rank, LP, date */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
            {game.tier && game.rank && (
              <span className="text-xs font-semibold text-gray-300">
                {game.tier} {game.rank}
              </span>
            )}
            {game.lpAfter !== null && (
              <span className="text-xs text-gray-400">{game.lpAfter} LP</span>
            )}
            {game.lpDelta !== null && (
              <span
                className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                  game.lpDelta >= 0
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {game.lpDelta >= 0 ? `+${game.lpDelta}` : game.lpDelta} LP
              </span>
            )}
            <span className="text-gray-600 text-[11px] ml-auto">{date}</span>
          </div>

          {/* Augments */}
          {game.augments.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {game.augments.map((aug, i) => (
                <span
                  key={i}
                  className="text-[11px] bg-purple-500/15 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full"
                >
                  {cleanAugment(aug)}
                </span>
              ))}
            </div>
          )}

          {/* Units */}
          {topUnits.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {topUnits.map((unit, i) => (
                <span
                  key={i}
                  className="text-[11px] bg-gray-700/80 text-gray-300 px-2 py-0.5 rounded"
                >
                  {cleanUnit(unit.character_id)}
                  {unit.tier > 1 && (
                    <span className="text-yellow-400 ml-0.5">
                      {'★'.repeat(unit.tier)}
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
