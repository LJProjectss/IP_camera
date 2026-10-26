import { useState, type FormEvent } from 'react'
import { CATEGORIES, STREAM_TYPES, type Camera, type Category, type StreamType } from '../types'
import { detectStreamType } from '../lib/streams'

type Props = {
  location: { lat: number; lon: number } | null
  picking: boolean
  onTogglePick: () => void
  onAdd: (camera: Camera) => void
  onCancel: () => void
}

/** Formulier om zelf een officiële webcam toe te voegen. De camera wordt in deze browser bewaard. */
export function AddCameraForm({ location, picking, onTogglePick, onAdd, onCancel }: Props) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [streamType, setStreamType] = useState<StreamType | 'auto'>('auto')
  const [category, setCategory] = useState<Category>('overig')
  const [attribution, setAttribution] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')

  const resolvedType = streamType === 'auto' ? detectStreamType(url) : streamType
  const canSave = name.trim() && url.trim() && attribution.trim() && location

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!canSave || !location) return
    onAdd({
      id: `manual-${crypto.randomUUID()}`,
      name: name.trim(),
      lat: location.lat,
      lon: location.lon,
      category,
      streamType: resolvedType,
      streamUrl: url.trim(),
      attribution: attribution.trim(),
      sourceUrl: sourceUrl.trim() || undefined,
    })
  }

  return (
    <form className="add-form" onSubmit={submit}>
      <h2>Camera toevoegen</h2>
      <p className="hint">
        Voeg alleen camera's toe die de eigenaar zelf openbaar heeft gemaakt, en vermeld de bron.
      </p>
      <label>
        Naam
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Haven Scheveningen" />
      </label>
      <label>
        Stream- of embed-URL
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
      </label>
      <label>
        Formaat
        <select value={streamType} onChange={(e) => setStreamType(e.target.value as StreamType | 'auto')}>
          <option value="auto">
            Automatisch ({STREAM_TYPES.find((t) => t.value === resolvedType)?.label})
          </option>
          {STREAM_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Soort
        <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Naamsvermelding (eigenaar)
        <input value={attribution} onChange={(e) => setAttribution(e.target.value)} placeholder="Gemeente Den Haag" />
      </label>
      <label>
        Bronpagina (optioneel)
        <input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://…" />
      </label>
      <div className="location-row">
        <span>
          {location ? `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}` : 'Nog geen locatie'}
        </span>
        <button type="button" className={picking ? 'active' : ''} onClick={onTogglePick}>
          {picking ? 'Klik op de kaart…' : 'Kies op kaart'}
        </button>
      </div>
      <div className="form-actions">
        <button type="button" onClick={onCancel}>
          Annuleren
        </button>
        <button type="submit" className="primary" disabled={!canSave}>
          Opslaan
        </button>
      </div>
    </form>
  )
}
