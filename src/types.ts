export type StreamType = 'hls' | 'mjpeg' | 'snapshot' | 'embed' | 'youtube'

export type Category = 'verkeer' | 'stad' | 'natuur' | 'strand' | 'haven' | 'weer' | 'overig'

export type Camera = {
  id: string
  name: string
  lat: number
  lon: number
  category: Category
  streamType: StreamType
  streamUrl: string
  /** Seconden tussen verversingen, alleen voor snapshots. */
  refreshSeconds?: number
  /** Pagina van de eigenaar of aanbieder. */
  sourceUrl?: string
  /** Naamsvermelding die bij het beeld moet staan. */
  attribution: string
  license?: string
  online?: boolean
  lastChecked?: string
  /** Door de gebruiker zelf toegevoegd (opgeslagen in de browser). */
  manual?: boolean
}

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'verkeer', label: 'Verkeer' },
  { value: 'stad', label: 'Stad' },
  { value: 'natuur', label: 'Natuur' },
  { value: 'strand', label: 'Strand' },
  { value: 'haven', label: 'Haven' },
  { value: 'weer', label: 'Weer' },
  { value: 'overig', label: 'Overig' },
]

export const STREAM_TYPES: { value: StreamType; label: string }[] = [
  { value: 'hls', label: 'HLS-stream (.m3u8)' },
  { value: 'youtube', label: 'YouTube-livestream' },
  { value: 'embed', label: 'Embed van de aanbieder' },
  { value: 'mjpeg', label: 'MJPEG-stream' },
  { value: 'snapshot', label: 'Snapshot (ververst)' },
]
