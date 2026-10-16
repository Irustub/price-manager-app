import { money, unitPrice } from '../lib/calculations'
import { productsRepo, suppliersRepo } from '../services/repos'
import { useRepo } from '../services/useRepo'

export default function Compare() {
  const { items: products } = useRepo(productsRepo)
  const { items: suppliers } = useRepo(suppliersRepo)
  const groups = new Map<string, typeof products>()
  for (const p of products) {
    const key = p.name.trim().toLowerCase()
    groups.set(key, [...(groups.get(key) ?? []), p])
  }
  const multi = [...groups.values()].filter((g) => g.length > 1)
  return (
    <>
      <h2>Comparar precios</h2>
      {multi.length === 0 && <p>Agrega el mismo producto (mismo nombre) en 2 o más proveedores para compararlos.</p>}
      {multi.map((g) => {
        const sorted = [...g].sort((a, b) => unitPrice(a.price, a.packageQty) - unitPrice(b.price, b.packageQty))
        return (
          <div className="card" key={g[0].id}>
            <strong>{g[0].name}</strong>
            <table>
              <thead><tr><th>Proveedor</th><th>Paquete</th><th>Precio unitario</th></tr></thead>
              <tbody>
                {sorted.map((p, i) => (
                  <tr key={p.id} className={i === 0 ? 'best' : ''}>
                    <td>{suppliers.find((s) => s.id === p.supplierId)?.name}</td>
                    <td>{money(p.price)} / {p.packageQty}</td>
                    <td>{money(unitPrice(p.price, p.packageQty))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}
    </>
  )
}
