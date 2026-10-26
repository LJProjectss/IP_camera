import type { Camera } from '../types'
import { CATEGORIES } from '../types'
import { CameraPlayer } from './CameraPlayer'

type Props = {
  camera: Camera
  onClose: () => void
  onRemove?: () => void
}

/** Zijpaneel met het live beeld, de bron en de naamsvermelding van de gekozen camera. */
export function CameraDetails({ camera, onClose, onRemove }: Props) {
  const category = CATEGORIES.find((c) => c.value === camera.category)?.label
  return (
    <aside className="details">
      <header>
        <div>
          <h2>{camera.name}</h2>
          <span className="meta">
            {category}
            {camera.online === false && ' · offline'}
          </span>
        </div>
        <button className="icon" onClick={onClose} aria-label="Sluiten">
          ×
        </button>
      </header>
      <CameraPlayer camera={camera} />
      <dl>
        <dt>Bron</dt>
        <dd>
          {camera.sourceUrl ? (
            <a href={camera.sourceUrl} target="_blank" rel="noreferrer">
              {camera.attribution}
            </a>
          ) : (
            camera.attribution
          )}
        </dd>
        {camera.license && (
          <>
            <dt>Voorwaarden</dt>
            <dd>{camera.license}</dd>
          </>
        )}
      </dl>
      <div className="details-actions">
        {/* Volgt in fase 2, samen met het dashboard. */}
        <button disabled title="Komt in fase 2">
          Toevoegen aan dashboard
        </button>
        {onRemove && (
          <button className="danger" onClick={onRemove}>
            Verwijderen
          </button>
        )}
      </div>
    </aside>
  )
}
