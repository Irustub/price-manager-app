import { useState } from 'react'
import type { FormEvent } from 'react'
import LocationMap from '../components/LocationMap'
import { distanceKm, money } from '../lib/calculations'
import { productsRepo, suppliersRepo } from '../services/repos'
import { useRepo } from '../services/useRepo'

export default function Suppliers() {
  const { items: suppliers, reload } = useRepo(suppliersRepo)
  const { items: products } = useRepo(productsRepo)
  const [name, setName] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')

  const nLat = parseFloat(lat)
  const nLng = parseFloat(lng)
  const hasPoint = Number.isFinite(nLat) && Number.isFinite(nLng)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !hasPoint) return
    await suppliersRepo.add({ name: name.trim(), lat: nLat, lng: nLng })
    setName(''); setLat(''); setLng('')
    await reload()
  }

  return (
    <>
      <h2>Proveedores</h2>
      <form className="card form" onSubmit={submit}>
        <input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Latitud" value={lat} onChange={(e) => setLat(e.target.value)} required />
        <input placeholder="Longitud" value={lng} onChange={(e) => setLng(e.target.value)} required />
        <button type="submit">Agregar</button>
        <small>Haz clic en el mapa para elegir la ubicación.</small>
      </form>
      <LocationMap
        points={suppliers}
        selected={hasPoint ? { lat: nLat, lng: nLng } : null}
        onPick={(a, b) => { setLat(a.toFixed(6)); setLng(b.toFixed(6)) }}
      />
      {suppliers.map((s) => (
        <div className="card" key={s.id}>
          <div className="row">
            <strong>{s.name}</strong>
            <button className="danger" onClick={async () => { await suppliersRepo.remove(s.id); await reload() }}>Eliminar</button>
          </div>
          <small>{s.lat}, {s.lng}</small>
          <ul>
            {products.filter((p) => p.supplierId === s.id).map((p) => (
              <li key={p.id}>{p.name} ({p.type}) — {money(p.price)} / {p.packageQty}</li>
            ))}
          </ul>
          <ul>
            {suppliers.filter((o) => o.id !== s.id).map((o) => (
              <li key={o.id}>Distancia a {o.name}: {distanceKm(s.lat, s.lng, o.lat, o.lng).toFixed(1)} km</li>
            ))}
          </ul>
        </div>
      ))}
    </>
  )
}
