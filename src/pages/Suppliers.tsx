import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import LocationMap from '../components/LocationMap'
import { distanceKm, money } from '../lib/calculations'
import { productsRepo, suppliersRepo } from '../services/repos'
import { searchAddresses } from '../services/geocoding'
import type { Supplier } from '../lib/types'
import type { AddressSuggestion } from '../services/geocoding'
import { useRepo } from '../services/useRepo'

export default function Suppliers() {
  const { items: suppliers, reload } = useRepo(suppliersRepo)
  const { items: products } = useRepo(productsRepo)
  const [name, setName] = useState('')
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [selected, setSelected] = useState<AddressSuggestion | null>(null)
  const [savedMessage, setSavedMessage] = useState('')
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const isEditing = editingId !== null
  const isValid = name.trim() !== '' && selected !== null

  useEffect(() => {
    if (!savedMessage) return
    const t = setTimeout(() => setSavedMessage(''), 3000)
    return () => clearTimeout(t)
  }, [savedMessage])

  useEffect(() => {
    if (selected && query === selected.label) { setSuggestions([]); return }
    const ctrl = new AbortController()
    const t = setTimeout(() => {
      searchAddresses(query, ctrl.signal).then(setSuggestions).catch(() => {})
    }, 400)
    return () => { clearTimeout(t); ctrl.abort() }
  }, [query, selected])

  function handleSelectSuggestion(s: AddressSuggestion) {
    setSelected(s); setQuery(s.label); setSuggestions([]); setError('')
  }

  function handleClearLocation() {
    setSelected(null); setQuery(''); setSuggestions([])
  }

  function resetForm() {
    setName(''); setQuery(''); setSelected(null); setSuggestions([]); setEditingId(null); setError('')
  }

  async function handleSave() {
    await suppliersRepo.add({ name: name.trim(), lat: selected!.lat, lng: selected!.lng, address: selected!.label })
  }

  async function handleUpdate() {
    await suppliersRepo.update({ id: editingId!, name: name.trim(), lat: selected!.lat, lng: selected!.lng, address: selected!.label })
  }

  function handleEdit(s: Supplier) {
    const label = s.address ?? `${s.lat.toFixed(5)}, ${s.lng.toFixed(5)}`
    setEditingId(s.id); setName(s.name)
    setSelected({ label, lat: s.lat, lng: s.lng }); setQuery(label)
    setSuggestions([]); setError(''); setSavedMessage('')
  }

  async function handleDelete(id: string) {
    await suppliersRepo.remove(id)
    if (editingId === id) resetForm()
    await reload()
  }

  function handleCancel() { resetForm() }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Ingresa un nombre para el proveedor'); return }
    if (!selected) { setError('Selecciona y confirma una ubicación de las sugerencias'); return }
    if (isEditing) await handleUpdate(); else await handleSave()
    resetForm()
    setSavedMessage(isEditing ? '✓ Cambios guardados' : '✓ Proveedor guardado')
    await reload()
  }

  return (
    <>
      <h2>Proveedores</h2>
      <form className="card form" onSubmit={submit}>
        <input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            placeholder="Buscar dirección (ej: Antonia López de Bello 208, Recoleta, Santiago)"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(null); setError('') }}
            style={{ width: '100%' }}
          />
          {suggestions.length > 0 && (
            <ul className="suggestions" style={{ position: 'absolute', zIndex: 1000, left: 0, right: 0, margin: 0, padding: 0, listStyle: 'none', background: '#111', border: '1px solid #444' }}>
              {suggestions.map((s) => (
                <li key={`${s.lat},${s.lng},${s.label}`} style={{ padding: '6px 8px', cursor: 'pointer' }} onClick={() => handleSelectSuggestion(s)}>{s.label}</li>
              ))}
            </ul>
          )}
        </div>
        {selected && <button type="button" onClick={handleClearLocation}>Limpiar ubicación</button>}
        <button type="submit" disabled={!isValid}>{isEditing ? 'Guardar cambios' : 'Agregar'}</button>
        {isEditing && <button type="button" onClick={handleCancel}>Cancelar</button>}
        {!isValid && <small>Requiere nombre y ubicación confirmada</small>}
        {error && <small role="alert" style={{ color: 'crimson' }}>{error}</small>}
        {savedMessage && <small>{savedMessage}</small>}
      </form>
      <LocationMap points={suppliers} selected={selected} />
      {suppliers.map((s) => (
        <div className="card" key={s.id}>
          <div className="row">
            <strong>{s.name}</strong>
            <span>
              <button onClick={() => handleEdit(s)}>Editar</button>{' '}
              <button className="danger" onClick={() => handleDelete(s.id)}>Eliminar</button>
            </span>
          </div>
          <small>📍 {s.address ?? `${s.lat.toFixed(5)}, ${s.lng.toFixed(5)}`}</small>
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
