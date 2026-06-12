'use client'

import { useCallback, useEffect, useState } from 'react'
import { fetchGames, fetchStats, type Game, type Stats } from '../utils/api'
import { StatsPanel } from '../components/StatsPanel'
import { LpChart } from '../components/LpChart'
import { GameHistory } from '../components/GameHistory'

const PAGE_SIZE = 20

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [games, setGames] = useState<Game[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const [statsData, gamesData] = await Promise.all([
        fetchStats(),
        fetchGames(PAGE_SIZE, 0),
      ])
      setStats(statsData)
      setGames(gamesData.games)
      setTotal(gamesData.total)
      setLastRefresh(new Date())
    } catch {
      setError(
        'Impossible de contacter le backend. Assurez-vous que le serveur tourne sur le port 3001.\n' +
        'Lancez : cd backend && pnpm dev'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    // Auto-refresh toutes les 5 minutes
    const interval = setInterval(load, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [load])

  const loadMore = async () => {
    setLoadingMore(true)
    try {
      const data = await fetchGames(PAGE_SIZE, games.length)
      setGames(prev => [...prev, ...data.games])
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-800 bg-gray-900/95 backdrop-blur px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎮</span>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">
                TFT Ranked Tracker
              </h1>
              {stats?.summoner && (
                <p className="text-gray-400 text-xs">
                  {stats.summoner.gameName}#{stats.summoner.tagLine}
                  <span className="text-gray-600 ml-1">— {stats.summoner.region}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lastRefresh && (
              <span className="text-gray-600 text-xs hidden sm:block">
                Mis à jour {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={() => { setLoading(true); load() }}
              className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors"
            >
              ↺ Rafraîchir
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-6">

        {/* État chargement initial */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Connexion au backend…</p>
          </div>
        )}

        {/* Erreur de connexion */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 mb-6">
            <p className="text-red-400 font-medium mb-1">⚠️ Erreur de connexion</p>
            <p className="text-red-300/70 text-sm whitespace-pre-line">{error}</p>
          </div>
        )}

        {/* Contenu principal */}
        {!loading && !error && (
          <>
            {/* Stats */}
            {stats ? (
              <StatsPanel stats={stats} />
            ) : (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 mb-6 text-center">
                <p className="text-gray-400 text-sm">
                  Aucune donnée disponible. Configurez votre{' '}
                  <code className="text-indigo-400">.env</code> puis lancez le backend.
                </p>
              </div>
            )}

            {/* Graphique LP */}
            {stats && stats.lpHistory.length >= 2 && (
              <LpChart stats={stats} />
            )}

            {/* Historique */}
            <GameHistory
              games={games}
              total={total}
              onLoadMore={loadMore}
              loading={loadingMore}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-4 text-center text-gray-600 text-xs">
        TFT Ranked Tracker — Parties Classées uniquement (queue 1100) • Auto-refresh 5 min
      </footer>
    </div>
  )
}
