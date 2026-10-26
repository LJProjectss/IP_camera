// Bouwt public/cameras.json uit de bronnen.
// - data/manual-cameras.json: officiële webcams die we zelf hebben vastgelegd
// - Windy Webcams API (alleen als WINDY_API_KEY gezet is)
//
// Gebruik: WINDY_API_KEY=... node scripts/import-cameras.mjs

import { readFile, writeFile } from 'node:fs/promises'

const COUNTRIES = (process.env.CAMERA_COUNTRIES ?? 'NL').split(',')
const WINDY_URL = 'https://api.windy.com/webcams/api/v3/webcams'
const PAGE_SIZE = 50
// De gratis laag staat een offset tot 10.000 toe.
const MAX_OFFSET = 10000

const CATEGORY_MAP = {
  traffic: 'verkeer',
  city: 'stad',
  square: 'stad',
  building: 'stad',
  beach: 'strand',
  coast: 'strand',
  harbor: 'haven',
  port: 'haven',
  water: 'haven',
  weather: 'weer',
  meteo: 'weer',
  landscape: 'natuur',
  lake: 'natuur',
  forest: 'natuur',
  mountain: 'natuur',
  park: 'natuur',
}

function mapCategory(categories = []) {
  for (const c of categories) {
    const hit = CATEGORY_MAP[c.id] ?? CATEGORY_MAP[c.name?.toLowerCase()]
    if (hit) return hit
  }
  return 'overig'
}

/** De player-velden zijn soms een URL, soms een object met een embed-URL. */
function playerUrl(player = {}) {
  for (const key of ['live', 'day', 'month', 'year', 'lifetime']) {
    const value = player[key]
    if (typeof value === 'string' && value) return value
    if (value && typeof value === 'object' && (value.embed || value.link)) return value.embed ?? value.link
  }
  return null
}

async function fetchWindy(apiKey) {
  const cameras = []
  for (let offset = 0; offset <= MAX_OFFSET; offset += PAGE_SIZE) {
    const params = new URLSearchParams({
      countries: COUNTRIES.join(','),
      limit: String(PAGE_SIZE),
      offset: String(offset),
      include: 'location,player,urls,categories',
      lang: 'nl',
    })
    const res = await fetch(`${WINDY_URL}?${params}`, { headers: { 'x-windy-api-key': apiKey } })
    if (!res.ok) throw new Error(`Windy gaf HTTP ${res.status}: ${await res.text()}`)
    const body = await res.json()
    for (const w of body.webcams ?? []) {
      const url = playerUrl(w.player)
      if (!url || !w.location) continue
      cameras.push({
        id: `windy-${w.webcamId}`,
        name: w.title,
        lat: w.location.latitude,
        lon: w.location.longitude,
        category: mapCategory(w.categories),
        streamType: 'embed',
        streamUrl: url,
        sourceUrl: w.urls?.detail ?? undefined,
        attribution: 'Windy Webcams',
        license: 'Windy Webcams API, gratis laag, niet-commercieel, naamsvermelding verplicht',
        online: w.status === 'active',
        lastChecked: new Date().toISOString(),
      })
    }
    if (offset + PAGE_SIZE >= (body.total ?? 0)) break
  }
  return cameras
}

const manual = JSON.parse(await readFile(new URL('../data/manual-cameras.json', import.meta.url), 'utf8'))
let windy = []
if (process.env.WINDY_API_KEY) {
  windy = await fetchWindy(process.env.WINDY_API_KEY)
} else {
  console.warn('WINDY_API_KEY ontbreekt; alleen de handmatige lijst wordt gebruikt.')
}

const all = [...manual, ...windy]
await writeFile(new URL('../public/cameras.json', import.meta.url), JSON.stringify(all, null, 2) + '\n')
console.log(`${all.length} camera's geschreven (${manual.length} handmatig, ${windy.length} van Windy).`)
