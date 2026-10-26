import { useCallback, useEffect, useState } from 'react'
import type { Camera } from '../types'
import { loadJson, saveJson } from './storage'

const MANUAL_KEY = 'camerakaart.manual-cameras'

/** Laadt de geïmporteerde cameralijst en de camera's die je zelf hebt toegevoegd. */
export function useCameras() {
  const [imported, setImported] = useState<Camera[]>([])
  const [manual, setManual] = useState<Camera[]>(() => loadJson<Camera[]>(MANUAL_KEY, []))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('cameras.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<Camera[]>
      })
      .then(setImported)
      .catch((e) => setError(`Cameralijst kon niet geladen worden (${e.message}).`))
  }, [])

  const addManual = useCallback((camera: Camera) => {
    setManual((prev) => {
      const next = [...prev, { ...camera, manual: true }]
      saveJson(MANUAL_KEY, next)
      return next
    })
  }, [])

  const removeManual = useCallback((id: string) => {
    setManual((prev) => {
      const next = prev.filter((c) => c.id !== id)
      saveJson(MANUAL_KEY, next)
      return next
    })
  }, [])

  return { cameras: [...imported, ...manual], error, addManual, removeManual }
}
