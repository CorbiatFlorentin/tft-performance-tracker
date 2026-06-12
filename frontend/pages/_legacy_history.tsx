'use client'
// Historique intégré dans le dashboard principal (app/page.tsx).
import { useEffect } from 'react'

export default function HistoryRedirect() {
  useEffect(() => {
    window.location.replace('/')
  }, [])
  return null
}
