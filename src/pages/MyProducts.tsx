import { useState } from 'react'
import { componentCost, money, productCost, summarize } from '../lib/calculations'
import type { Component } from '../lib/types'
import { categoriesRepo, myProductsRepo, productsRepo } from '../services/repos'
import { useRepo } from '../services/useRepo'

export default function MyProducts() {
  const { items: mine, reload } = useRepo(myProductsRepo)
  const { items: products } = useRepo(productsRepo)
  const { items: categories } = useRepo(categoriesRepo)
  const [name, setName] = useState('')
  const [margin, setMargin] = useState('150')
  const [comps, setComps] = useState<Component[]>([])

  const catOf = (id: string) => categories.find((c) => c.id === products.find((p) => p.id === id)?.categoryId)
  const draft = summarize(productCost(comps, products, categories), Number(margin) || 0)

  async function save() {
    if (!name.trim() || comps.length === 0) return
    await myProductsRepo.add({ name: name.trim(), marginPercent: Number(margin) || 0, components: comps })
    setName(''); setComps([]); await reload()
  }
  const patch = (i: number, c: Partial<Component>) => setComps(comps.map((x, j) => (j === i ? { ...x, ...c } : x)))

  return (
    <>
      <h2>Mis productos</h2>
      <div className="card">
        <div className="form">
          <input placeholder="Nombre del producto" value={name} onChange={(e) => setName(e.target.value)} />
          <label>Margen de ganancia (%) <input type="number" min="0" step="any" value={margin} onChange={(e) => setMargin(e.target.value)} /></label>
          <button onClick={() => products[0] && setComps([...comps, { supplierProductId: products[0].id, quantity: 1 }])}>+ Componente</button>
        </div>
        {comps.map((c, i) => {
          const cat = catOf(c.supplierProductId)
          return (
            <div className="form" key={i}>
              <select value={c.supplierProductId} onChange={(e) => patch(i, { supplierProductId: e.target.value })}>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input type="number" min="0" step="any" value={c.quantity} onChange={(e) => patch(i, { quantity: Number(e.target.value) })} />
              <small>{cat?.kind === 'sheet' ? `unidades (1 hoja = ${cat.unitsPerSheet})` : 'unidades completas'}</small>
              <small>{money(componentCost(products.find((p) => p.id === c.supplierProductId)!, cat, c.quantity))}</small>
              <button className="danger" onClick={() => setComps(comps.filter((_, j) => j !== i))}>Quitar</button>
            </div>
          )
        })}
        <p>Costo: <b>{money(draft.cost)}</b> · Ganancia: <b>{money(draft.profit)}</b> · Precio final: <b>{money(draft.price)}</b></p>
        <button onClick={save}>Guardar producto</button>
      </div>
      {mine.map((m) => {
        const s = summarize(productCost(m.components, products, categories), m.marginPercent)
        return (
          <div className="card" key={m.id}>
            <div className="row">
              <strong>{m.name} <small>(margen {m.marginPercent}%)</small></strong>
              <span>
                <button onClick={async () => {
                  const v = Number(prompt('Nuevo margen (%)', String(m.marginPercent)))
                  if (Number.isFinite(v) && v >= 0) { await myProductsRepo.update({ ...m, marginPercent: v }); await reload() }
                }}>Cambiar margen</button>
                <button className="danger" onClick={async () => { await myProductsRepo.remove(m.id); await reload() }}>Eliminar</button>
              </span>
            </div>
            <ul>
              {m.components.map((c, i) => <li key={i}><small>{products.find((p) => p.id === c.supplierProductId)?.name ?? '(eliminado)'} × {c.quantity}</small></li>)}
            </ul>
            Costo {money(s.cost)} · Ganancia {money(s.profit)} · <b>Precio {money(s.price)}</b>
          </div>
        )
      })}
    </>
  )
}
