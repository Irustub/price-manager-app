import { useEffect } from 'react'
import { MapContainer, Marker, Tooltip, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export const SANTIAGO: [number, number] = [-33.45, -70.66]
const DEFAULT_ZOOM = 12

function flagIcon(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" viewBox="0 0 32 44">
<rect x="5" y="2" width="3" height="40" rx="1.5" fill="#444"/>
<path d="M8 3 H28 L22 11 L28 19 H8 Z" fill="${color}" stroke="#fff" stroke-width="1.5"/>
<circle cx="6.5" cy="42" r="2.5" fill="#444"/></svg>`
  return L.divIcon({
    html: svg,
    className: 'flag-icon',
    iconSize: [32, 44],
    iconAnchor: [6, 42],
    tooltipAnchor: [14, -30],
  })
}

const selectedIcon = flagIcon('#1e66f5')
const supplierIcon = flagIcon('#e03131')

export interface Point { id: string; name: string; lat: number; lng: number }

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) })
  return null
}

function Recenter({ target }: { target?: { lat: number; lng: number } | null }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.setView([target.lat, target.lng], Math.max(map.getZoom(), 15))
  }, [target?.lat, target?.lng]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

interface Props {
  points: Point[]
  onPick?: (lat: number, lng: number) => void
  selected?: { lat: number; lng: number } | null
}

export default function LocationMap({ points, onPick, selected }: Props) {
  return (
    <MapContainer center={SANTIAGO} zoom={DEFAULT_ZOOM} className="map">
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {onPick && <ClickHandler onPick={onPick} />}
      <Recenter target={selected} />
      {points.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={supplierIcon}>
          <Tooltip>{p.name}</Tooltip>
        </Marker>
      ))}
      {selected && (
        <Marker
          position={[selected.lat, selected.lng]}
          icon={selectedIcon}
          draggable={!!onPick}
          zIndexOffset={1000}
          eventHandlers={{
            dragend: (e) => {
              const { lat, lng } = (e.target as L.Marker).getLatLng()
              onPick?.(lat, lng)
            },
          }}
        >
          <Tooltip>Ubicación seleccionada</Tooltip>
        </Marker>
      )}
    </MapContainer>
  )
}
