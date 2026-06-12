'use client'

import type { Game } from '../utils/api'
import { GameCard } from './GameCard'

interface Props {
  games: Game[]
  total: number
  onLoadMore: () => void
  loading: boolean
}

export function GameHistory({ games, total, onLoadMore, loading }: Props) {
  if (games.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-10 border border-gray-700 text-center">
        <p className="text-4xl mb-3">🎮</p>
        <p className="text-gray-300 font-medium mb-1">Aucune partie classée enregistrée</p>
        <p className="text-gray-500 text-sm">
          Le tracker détecte automatiquement les nouvelles parties toutes les 5 minutes.
        </p>
        <p className="text-gray-600 text-xs mt-3">
          Seules les parties Classées (queue 1100) sont suivies.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-200 mb-4">
        Historique classé{' '}
        <span className="text-gray-500 font-normal text-sm">({total} parties)</span>
      </h2>

      {games.map(g => (
        <GameCard key={g.id} game={g} />
      ))}

      {games.length < total && (
        <button
          onClick={onLoadMore}
          disabled={loading}
          className="
            w-full mt-2 py-2.5 text-sm text-gray-400 hover:text-gray-200
            border border-gray-700 hover:border-gray-500
            rounded-xl transition-colors disabled:opacity-50
          "
        >
          {loading
            ? 'Chargement...'
            : `Charger la suite (${total - games.length} parties restantes)`}
        </button>
      )}
    </div>
  )
}
