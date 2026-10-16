import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import LocationMap from '../components/LocationMap'
import { distanceKm, money } from '../lib/calculations'
import { productsRepo, suppliersRepo } from '../services/repos'
import { reverseGeocode, searchAddresses } from '../services/geocoding'
import type { AddressResult } from '../services/geocoding'
import { useRepo } from '../services/useRepo'

export default function Suppliers() {
  const { items: suppliers, reload } = useRepo(suppliersRepo)
  const { items: products } = useRepo(productsRepo)
  const [name, setName] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')

  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<AddressResult[]>([])
  const [address, setAddress] = useState('')
  const [geoError, setGeoError] = useState('')

  const nLat = parseFloat(lat)
  const nLng = parseFloat(lng)
  const hasPoint = Number.isFinite(nLat) && Number.isFinite(nLng)

  useEffect(() => {
    if (query.trim().length < 3) { setSuggestions([]); return }
    const ctrl = new AbortController()
    const t = setTimeout(() => {
      searchAddresses(query, ctrl.signal).then(setSuggestions).catch(() => {})
    }, 400)
    return () => { clearTimeout(t); ctrl.abort() }
  }, [query])

  useEffect(() => {
    if (!hasPoint) { setAddress(''); return }
    const ctrl = new AbortController()
    const t = setTimeout(() => {
      reverseGeocode(nLat, nLng, ctrl.signal).then((a) => setAddress(a ?? '')).catch(() => {})
    }, 400)
    return () => { clearTimeout(t); ctrl.abort() }
  }, [nLat, nLng, hasPoint])

  function pick(a: number, b: number) { setLat(a.toFixed(6)); setLng(b.toFixed(6)) }

  function chooseSuggestion(s: AddressResult) {
    pick(s.lat, s.lng)
    setQuery(s.label)
    setSuggestions([])
  }

  function useCurrentLocation() {
    setGeoError('')
    if (!navigator.geolocation) { setGeoError('Geolocalización no disponible'); return }
    navigator.geolocation.getCurrentPosition(
      (p) => pick(p.coords.latitude, p.coords.longitude),
      () => setGeoError('No se pudo obtener la ubicación'),
    )
  }

  function clearSelection() { setLat(''); setLng(''); setQuery(''); setSuggestions([]); setAddress('') }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !hasPoint) return
    await suppliersRepo.add({ name: name.trim(), lat: nLat, lng: nLng })
    setName(''); clearSelection()
    await reload()
  }

  return (
    <>
      <h2>Proveedores</h2>
      <form className="card form" onSubmit={submit}>
        <input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Latitud" value={lat} onChange={(e) => setLat(e.target.value)} required />
        <input placeholder="Longitud" value={lng} onChange={(e) => setLng(e.target.value)} required />
        <input
          placeholder="Buscar dirección (ej: Alameda 1000, Santiago, Chile)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {suggestions.length > 0 && (
          <ul className="suggestions">
            {suggestions.map((s, i) => (
              <li key={i} onClick={() => chooseSuggestion(s)}>{s.label}</li>
            ))}
          </ul>
        )}
        <button type="button" onClick={useCurrentLocation}>Usar ubicación actual</button>
        <button type="button" onClick={clearSelection}>Limpiar selección</button>
        <button type="submit">Agregar</button>
        <small>Haz clic en el mapa o arrastra el banderín azul para elegir la ubicación.</small>
        {geoError && <small>{geoError}</small>}
        {hasPoint && <small>Coordenadas: {nLat.toFixed(6)}, {nLng.toFixed(6)}{address && ` — ${address}`}</small>}
      </form>
      <LocationMap
        points={suppliers}
        selected={hasPoint ? { lat: nLat, lng: nLng } : null}
        onPick={pick}
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
