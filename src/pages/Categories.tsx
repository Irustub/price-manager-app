import { useState } from 'react'
import type { FormEvent } from 'react'
import type { CategoryKind } from '../lib/types'
import { categoriesRepo } from '../services/repos'
import { useRepo } from '../services/useRepo'

export default function Categories() {
  const { items, reload } = useRepo(categoriesRepo)
  const [name, setName] = useState('')
  const [kind, setKind] = useState<CategoryKind>('sheet')
  const [units, setUnits] = useState('20')

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await categoriesRepo.add({
      name: name.trim(), kind,
      unitsPerSheet: kind === 'sheet' ? Math.max(1, Number(units) || 1) : 1,
    })
    setName('')
    await reload()
  }

  return (
    <>
      <h2>Categorías y divisores</h2>
      <form className="card form" onSubmit={submit}>
        <input placeholder="Nombre (ej: Hojas)" value={name} onChange={(e) => setName(e.target.value)} required />
        <select value={kind} onChange={(e) => setKind(e.target.value as CategoryKind)}>
          <option value="sheet">Hojas (con divisor)</option>
          <option value="object">Objetos (unidad completa)</option>
        </select>
        {kind === 'sheet' && (
          <input type="number" min="1" value={units} onChange={(e) => setUnits(e.target.value)} placeholder="Unidades por hoja" />
        )}
        <button type="submit">Agregar</button>
      </form>
      {items.map((c) => (
        <div className="card row" key={c.id}>
          <span>
            <strong>{c.name}</strong> — {c.kind === 'sheet' ? `${c.unitsPerSheet} unidades por hoja` : 'unidad completa'}
          </span>
          <span>
            {c.kind === 'sheet' && (
              <button onClick={async () => {
                const v = Number(prompt('Unidades por hoja', String(c.unitsPerSheet)))
                if (v >= 1) { await categoriesRepo.update({ ...c, unitsPerSheet: v }); await reload() }
              }}>Editar divisor</button>
            )}
            <button className="danger" onClick={async () => { await categoriesRepo.remove(c.id); await reload() }}>Eliminar</button>
          </span>
        </div>
      ))}
    </>
  )
}
