import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet'
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

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) })
  return null
}

interface Props {
  points: Point[]
  onPick?: (lat: number, lng: number) => void
  selected?: { lat: number; lng: number } | null
}

export default function LocationMap({ points, onPick, selected }: Props) {
  const first = selected ?? points[0]
  const center: [number, number] = first ? [first.lat, first.lng] : [-33.45, -70.66]
  return (
    <MapContainer center={center} zoom={first ? 11 : 5} className="map">
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {onPick && <ClickHandler onPick={onPick} />}
      {points.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]}>
          <Popup>{p.name}</Popup>
        </Marker>
      ))}
      {selected && <Marker position={[selected.lat, selected.lng]} />}
    </MapContainer>
  )
}
