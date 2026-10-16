import { useState } from 'react'
import type { FormEvent } from 'react'
import { money, unitPrice } from '../lib/calculations'
import { categoriesRepo, historyRepo, productsRepo, suppliersRepo, updatePrice } from '../services/repos'
import { useRepo } from '../services/useRepo'

export default function SupplierProducts() {
  const { items: products, reload } = useRepo(productsRepo)
  const { items: suppliers } = useRepo(suppliersRepo)
  const { items: categories } = useRepo(categoriesRepo)
  const { items: history, reload: reloadHistory } = useRepo(historyRepo)
  const [f, setF] = useState({ supplierId: '', name: '', type: '', price: '', packageQty: '1', categoryId: '', sourceUrl: '' })
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })

  async function submit(e: FormEvent) {
    e.preventDefault()
    const price = Number(f.price)
    const supplierId = f.supplierId || suppliers[0]?.id
    if (!supplierId || !f.name.trim() || !(price >= 0)) return
    const p = await productsRepo.add({
      supplierId, name: f.name.trim(), type: f.type.trim(), price,
      packageQty: Math.max(1, Number(f.packageQty) || 1),
      categoryId: f.categoryId, sourceUrl: f.sourceUrl,
    })
    await historyRepo.add({ productId: p.id, price, date: new Date().toISOString() })
    setF({ ...f, name: '', type: '', price: '', packageQty: '1', sourceUrl: '' })
    await reload(); await reloadHistory()
  }

  async function changePrice(id: string) {
    const p = products.find((x) => x.id === id)
    if (!p) return
    const v = Number(prompt('Nuevo precio del paquete', String(p.price)))
    if (Number.isFinite(v) && v >= 0) { await updatePrice(p, v); await reload(); await reloadHistory() }
  }

  const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name))
  return (
    <>
      <h2>Productos de proveedores</h2>
      <form className="card form" onSubmit={submit}>
        <select value={f.supplierId} onChange={set('supplierId')} required>
          <option value="" disabled>Proveedor…</option>
          {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input placeholder="Nombre (Papel Fotográfico)" value={f.name} onChange={set('name')} required />
        <input placeholder="Tipo" value={f.type} onChange={set('type')} />
        <input type="number" min="0" step="any" placeholder="Precio del paquete" value={f.price} onChange={set('price')} required />
        <input type="number" min="1" placeholder="Cantidad en paquete" value={f.packageQty} onChange={set('packageQty')} />
        <select value={f.categoryId} onChange={set('categoryId')}>
          <option value="">Sin categoría</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input placeholder="URL (scraping futuro)" value={f.sourceUrl} onChange={set('sourceUrl')} />
        <button type="submit">Agregar</button>
      </form>
      {sorted.map((p) => (
        <div className="card" key={p.id}>
          <div className="row">
            <strong>{p.name} <small>({p.type || 'sin tipo'})</small></strong>
            <span>
              <button onClick={() => changePrice(p.id)}>Actualizar precio</button>
              <button className="danger" onClick={async () => { await productsRepo.remove(p.id); await reload() }}>Eliminar</button>
            </span>
          </div>
          <small>
            {suppliers.find((s) => s.id === p.supplierId)?.name ?? '?'} · {money(p.price)} por {p.packageQty} = {money(unitPrice(p.price, p.packageQty))} c/u ·{' '}
          </small>
          <select value={p.categoryId} onChange={async (e) => { await productsRepo.update({ ...p, categoryId: e.target.value }); await reload() }}>
            <option value="">Sin categoría</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <ul>
            {history.filter((h) => h.productId === p.id).sort((a, b) => b.date.localeCompare(a.date)).map((h) => (
              <li key={h.id}><small>{new Date(h.date).toLocaleDateString()} — {money(h.price)}</small></li>
            ))}
          </ul>
        </div>
      ))}
    </>
  )
}
