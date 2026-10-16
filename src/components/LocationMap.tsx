import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import icon from 'leaflet/dist/images/marker-icon.png'
import icon2x from 'leaflet/dist/images/marker-icon-2x.png'
import shadow from 'leaflet/dist/images/marker-shadow.png'

L.Marker.prototype.options.icon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: icon2x,
  shadowUrl: shadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

export interface Point { id: string; name: string; lat: number; lng: number }

const redIcon = L.divIcon({
  className: '',
  html: '<div style="font-size:30px;line-height:30px">🚩</div>',
  iconSize: [30, 30],
  iconAnchor: [6, 30],
  popupAnchor: [8, -28],
})

function FlyTo({ target }: { target?: { lat: number; lng: number } | null }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 16)
  }, [map, target])
  return null
}

interface Props {
  points: Point[]
  selected?: { lat: number; lng: number } | null
}

export default function LocationMap({ points, selected }: Props) {
  const first = selected ?? points[0]
  const center: [number, number] = first ? [first.lat, first.lng] : [-33.45, -70.66]
  return (
    <MapContainer center={center} zoom={first ? 11 : 5} className="map">
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyTo target={selected} />
      {points.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={redIcon}>
          <Popup>{p.name}</Popup>
        </Marker>
      ))}
      {selected && <Marker position={[selected.lat, selected.lng]} />}
    </MapContainer>
  )
}
