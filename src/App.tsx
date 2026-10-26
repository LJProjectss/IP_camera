import { useMemo, useState } from 'react'
import { CameraMap } from './components/CameraMap'
import { CameraDetails } from './components/CameraDetails'
import { AddCameraForm } from './components/AddCameraForm'
import { useCameras } from './lib/useCameras'
import { CATEGORIES, type Category } from './types'

export default function App() {
  const { cameras, error, addManual, removeManual } = useCameras()
  const [query, setQuery] = useState('')
  const [categories, setCategories] = useState<Set<Category>>(new Set())
  const [onlyOnline, setOnlyOnline] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [picking, setPicking] = useState(false)
  const [newLocation, setNewLocation] = useState<{ lat: number; lon: number } | null>(null)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return cameras.filter(
      (c) =>
        (!q || c.name.toLowerCase().includes(q)) &&
        (categories.size === 0 || categories.has(c.category)) &&
        (!onlyOnline || c.online !== false),
    )
  }, [cameras, query, categories, onlyOnline])

  const selected = cameras.find((c) => c.id === selectedId) ?? null

  function toggleCategory(value: Category) {
    setCategories((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  function closeForm() {
    setAdding(false)
    setPicking(false)
    setNewLocation(null)
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>Camerakaart</h1>
        <input
          className="search"
          type="search"
          placeholder="Zoek op naam"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="chips">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              className={categories.has(c.value) ? 'chip on' : 'chip'}
              onClick={() => toggleCategory(c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <label className="check">
          <input type="checkbox" checked={onlyOnline} onChange={(e) => setOnlyOnline(e.target.checked)} />
          Alleen online camera's
        </label>

        {error && <p className="error">{error}</p>}

        {adding ? (
          <AddCameraForm
            location={newLocation}
            picking={picking}
            onTogglePick={() => setPicking((p) => !p)}
            onAdd={(camera) => {
              addManual(camera)
              setSelectedId(camera.id)
              closeForm()
            }}
            onCancel={closeForm}
          />
        ) : (
          <>
            <p className="count">
              {visible.length} van {cameras.length} camera's
            </p>
            <ul className="list">
              {visible.slice(0, 200).map((c) => (
                <li key={c.id}>
                  <button className={c.id === selectedId ? 'on' : ''} onClick={() => setSelectedId(c.id)}>
                    <span className={c.online === false ? 'dot off' : 'dot'} />
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
            {cameras.length === 0 && !error && (
              <p className="hint">
                Er staan nog geen camera's in de lijst. Voeg er zelf een toe, of draai de import van Windy
                Webcams (zie README).
              </p>
            )}
            <button className="primary add" onClick={() => setAdding(true)}>
              Camera toevoegen
            </button>
          </>
        )}
      </aside>

      <main className="map-wrap">
        <CameraMap
          cameras={visible}
          selectedId={selectedId}
          onSelect={setSelectedId}
          pickLocation={
            picking
              ? (lat, lon) => {
                  setNewLocation({ lat, lon })
                  setPicking(false)
                }
              : undefined
          }
        />
        {selected && (
          <CameraDetails
            camera={selected}
            onClose={() => setSelectedId(null)}
            onRemove={
              selected.manual
                ? () => {
                    removeManual(selected.id)
                    setSelectedId(null)
                  }
                : undefined
            }
          />
        )}
      </main>
    </div>
  )
}
