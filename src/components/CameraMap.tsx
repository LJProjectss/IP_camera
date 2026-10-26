import { useEffect, useRef, useState } from 'react'
import { Map as MapLibreMap, NavigationControl, setWorkerUrl, type GeoJSONSource, type MapMouseEvent, type StyleSpecification } from 'maplibre-gl'
import type { FeatureCollection, Point } from 'geojson'
import 'maplibre-gl/dist/maplibre-gl.css'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import type { Camera } from '../types'

type Props = {
  cameras: Camera[]
  selectedId: string | null
  onSelect: (id: string) => void
  /** Als dit aan staat, geeft een klik op de kaart coördinaten door in plaats van te selecteren. */
  pickLocation?: (lat: number, lon: number) => void
}

// De kaart rekent in een web worker; Vite moet weten waar dat bestand staat.
setWorkerUrl(workerUrl)

const NL_CENTER: [number, number] = [5.3, 52.2]

const style: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-bijdragers',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
}

function toGeoJson(cameras: Camera[]): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: cameras.map((c) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [c.lon, c.lat] },
      properties: { id: c.id, name: c.name, offline: c.online === false },
    })),
  }
}

export function CameraMap({ cameras, selectedId, onSelect, pickLocation }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<MapLibreMap | null>(null)
  const [loaded, setLoaded] = useState(false)
  // Handlers in refs, zodat de kaart niet opnieuw opgebouwd hoeft te worden als ze veranderen.
  const onSelectRef = useRef(onSelect)
  const pickRef = useRef(pickLocation)
  useEffect(() => {
    onSelectRef.current = onSelect
    pickRef.current = pickLocation
  })

  useEffect(() => {
    if (!container.current) return
    const m = new MapLibreMap({ container: container.current, style, center: NL_CENTER, zoom: 6.6 })
    m.addControl(new NavigationControl({ showCompass: false }), 'top-right')
    map.current = m

    m.on('load', () => {
      m.addSource('cameras', {
        type: 'geojson',
        data: toGeoJson([]),
        cluster: true,
        clusterRadius: 45,
        clusterMaxZoom: 13,
      })
      m.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'cameras',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#2563eb',
          'circle-opacity': 0.85,
          'circle-radius': ['step', ['get', 'point_count'], 16, 10, 20, 50, 26],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      })
      m.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'cameras',
        filter: ['has', 'point_count'],
        layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-size': 13 },
        paint: { 'text-color': '#fff' },
      })
      m.addLayer({
        id: 'camera',
        type: 'circle',
        source: 'cameras',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['case', ['get', 'offline'], '#9ca3af', '#2563eb'],
          'circle-radius': 7,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      })
      m.addLayer({
        id: 'camera-selected',
        type: 'circle',
        source: 'cameras',
        filter: ['==', ['get', 'id'], ''],
        paint: {
          'circle-color': '#f59e0b',
          'circle-radius': 10,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#fff',
        },
      })
      setLoaded(true)
    })

    m.on('click', (e: MapMouseEvent) => {
      if (pickRef.current) {
        pickRef.current(e.lngLat.lat, e.lngLat.lng)
        return
      }
      const [cluster] = m.queryRenderedFeatures(e.point, { layers: ['clusters'] })
      if (cluster) {
        const source = m.getSource('cameras') as GeoJSONSource
        source.getClusterExpansionZoom(cluster.properties.cluster_id).then((zoom) => {
          m.easeTo({ center: (cluster.geometry as Point).coordinates as [number, number], zoom })
        })
        return
      }
      const [point] = m.queryRenderedFeatures(e.point, { layers: ['camera', 'camera-selected'] })
      if (point) onSelectRef.current(point.properties.id)
    })

    for (const layer of ['clusters', 'camera']) {
      m.on('mouseenter', layer, () => (m.getCanvas().style.cursor = 'pointer'))
      m.on('mouseleave', layer, () => (m.getCanvas().style.cursor = ''))
    }

    return () => {
      setLoaded(false)
      m.remove()
      map.current = null
    }
  }, [])

  useEffect(() => {
    if (!loaded || !map.current) return
    ;(map.current.getSource('cameras') as GeoJSONSource).setData(toGeoJson(cameras))
  }, [loaded, cameras])

  useEffect(() => {
    if (!loaded || !map.current) return
    map.current.setFilter('camera-selected', ['==', ['get', 'id'], selectedId ?? ''])
  }, [loaded, selectedId])

  // Naar de gekozen camera bewegen, bijvoorbeeld na een klik in de lijst.
  const selected = cameras.find((c) => c.id === selectedId)
  const selectedLat = selected?.lat
  const selectedLon = selected?.lon
  useEffect(() => {
    if (!map.current || selectedLat === undefined || selectedLon === undefined) return
    map.current.easeTo({ center: [selectedLon, selectedLat], zoom: Math.max(map.current.getZoom(), 12) })
  }, [selectedLat, selectedLon])

  useEffect(() => {
    if (map.current) map.current.getCanvas().style.cursor = pickLocation ? 'crosshair' : ''
  }, [pickLocation])

  return <div ref={container} className="map" />
}
