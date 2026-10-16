import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import LocationMap from '../components/LocationMap'
import { distanceKm, money } from '../lib/calculations'
import { productsRepo, suppliersRepo } from '../services/repos'
import { useRepo } from '../services/useRepo'

interface GeoResult {
  place_id: number
  display_name: string
  name?: string
  lat: string
  lon: string
}

export default function Suppliers() {
  const { items: suppliers, reload } = useRepo(suppliersRepo)
  const { items: products } = useRepo(productsRepo)
  const [name, setName] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeoResult[]>([])
  const [open, setOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const skipSearch = useRef(false)

  useEffect(() => {
    if (skipSearch.current) { skipSearch.current = false; return }
    const q = query.trim()
    if (q.length < 3) { setResults([]); setSearching(false); return }
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      setSearching(true); setSearchError('')
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&accept-language=es&q=${encodeURIComponent(q)}`
        const res = await fetch(url, { signal: ctrl.signal })
        if (!res.ok) throw new Error(String(res.status))
        setResults(await res.json())
        setOpen(true)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') { setSearchError('No se pudo buscar la dirección.'); setResults([]) }
      } finally {
        if (!ctrl.signal.aborted) setSearching(false)
      }
    }, 500)
    return () => { clearTimeout(t); ctrl.abort() }
  }, [query])

  function choose(r: GeoResult) {
    skipSearch.current = true
    setQuery(r.display_name)
    setLat(parseFloat(r.lat).toFixed(6)); setLng(parseFloat(r.lon).toFixed(6))
    setResults([]); setOpen(false)
  }

  const nLat = parseFloat(lat)
  const nLng = parseFloat(lng)
  const hasPoint = Number.isFinite(nLat) && Number.isFinite(nLng)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !hasPoint) return
    await suppliersRepo.add({ name: name.trim(), lat: nLat, lng: nLng })
    setName(''); setLat(''); setLng(''); setQuery(''); setResults([])
    await reload()
  }

  return (
    <>
      <h2>Proveedores</h2>
      <form className="card form" onSubmit={submit}>
        <input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
        <div className="address-search">
          <input
            type="search"
            placeholder="Buscar dirección (ej: Antonia López de Bello 208, Recoleta, Santiago)"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setLat(''); setLng('') }}
            onFocus={() => results.length > 0 && setOpen(true)}
            autoComplete="off"
            aria-label="Dirección"
            required
          />
          {open && (results.length > 0 || searching) && (
            <ul className="address-suggestions" role="listbox">
              {searching && results.length === 0 && <li className="address-empty">Buscando…</li>}
              {results.map((r) => {
                const [title, ...rest] = r.display_name.split(', ')
                return (
                  <li key={r.place_id} role="option" aria-selected={false} onMouseDown={(e) => { e.preventDefault(); choose(r) }}>
                    <strong>{r.name || title}</strong>
                    <small>{rest.join(', ')}</small>
                  </li>
                )
              })}
            </ul>
          )}
          {searchError && <small>{searchError}</small>}
          {!searching && !hasPoint && query.trim().length >= 3 && results.length === 0 && !searchError && (
            <small>Selecciona una dirección de las sugerencias.</small>
          )}
        </div>
        <button type="submit" disabled={!hasPoint}>Agregar</button>
        <small>Busca una dirección o haz clic en el mapa para elegir la ubicación.</small>
      </form>
      <LocationMap
        points={suppliers}
        selected={hasPoint ? { lat: nLat, lng: nLng } : null}
        onPick={(a, b) => {
          skipSearch.current = true
          setLat(a.toFixed(6)); setLng(b.toFixed(6)); setQuery(`${a.toFixed(6)}, ${b.toFixed(6)}`); setOpen(false)
        }}
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
