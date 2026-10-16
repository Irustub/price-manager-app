import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import LocationMap from '../components/LocationMap'
import { distanceKm, money } from '../lib/calculations'
import { productsRepo, suppliersRepo } from '../services/repos'
import { searchAddresses } from '../services/geocoding'
import type { AddressSuggestion } from '../services/geocoding'
import { useRepo } from '../services/useRepo'

export default function Suppliers() {
  const { items: suppliers, reload } = useRepo(suppliersRepo)
  const { items: products } = useRepo(productsRepo)
  const [name, setName] = useState('')
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [selected, setSelected] = useState<AddressSuggestion | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (selected && query === selected.label) { setSuggestions([]); return }
    const ctrl = new AbortController()
    const t = setTimeout(() => {
      searchAddresses(query, ctrl.signal).then(setSuggestions).catch(() => {})
    }, 400)
    return () => { clearTimeout(t); ctrl.abort() }
  }, [query, selected])

  function pick(s: AddressSuggestion) {
    setSelected(s); setQuery(s.label); setSuggestions([]); setSaved(false)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !selected) return
    await suppliersRepo.add({ name: name.trim(), lat: selected.lat, lng: selected.lng })
    setName(''); setQuery(''); setSelected(null); setSaved(true)
    await reload()
  }

  return (
    <>
      <h2>Proveedores</h2>
      <form className="card form" onSubmit={submit}>
        <input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            placeholder="Buscar dirección (ej: Antonia López de Bello 208, Recoleta, Santiago)"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(null); setSaved(false) }}
            style={{ width: '100%' }}
          />
          {suggestions.length > 0 && (
            <ul className="suggestions" style={{ position: 'absolute', zIndex: 1000, left: 0, right: 0, margin: 0, padding: 0, listStyle: 'none', background: '#111', border: '1px solid #444' }}>
              {suggestions.map((s) => (
                <li key={`${s.lat},${s.lng},${s.label}`} style={{ padding: '6px 8px', cursor: 'pointer' }} onClick={() => pick(s)}>{s.label}</li>
              ))}
            </ul>
          )}
        </div>
        <button type="submit" disabled={!selected || !name.trim()}>📍 Confirmar ubicación</button>
        {saved && <small>✓ Ubicación guardada</small>}
      </form>
      <LocationMap points={suppliers} selected={selected} />
      {suppliers.map((s) => (
        <div className="card" key={s.id}>
          <div className="row">
            <strong>{s.name}</strong>
            <button className="danger" onClick={async () => { await suppliersRepo.remove(s.id); await reload() }}>Eliminar</button>
          </div>
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
