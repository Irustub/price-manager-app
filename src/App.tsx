import { HashRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { firebaseEnabled } from './services/firebase'
import Categories from './pages/Categories'
import Compare from './pages/Compare'
import MyProducts from './pages/MyProducts'
import SupplierProducts from './pages/SupplierProducts'
import Suppliers from './pages/Suppliers'

export default function App() {
  return (
    <HashRouter>
      <header>
        <h1>Price Manager</h1>
        <nav>
          <NavLink to="/suppliers">Proveedores</NavLink>
          <NavLink to="/supplier-products">Productos proveedor</NavLink>
          <NavLink to="/categories">Categorías</NavLink>
          <NavLink to="/my-products">Mis productos</NavLink>
          <NavLink to="/compare">Comparar</NavLink>
        </nav>
      </header>
      {!firebaseEnabled && (
        <p className="notice">Firebase no configurado: los datos se guardan solo en este navegador (localStorage).</p>
      )}
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/suppliers" replace />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/supplier-products" element={<SupplierProducts />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/my-products" element={<MyProducts />} />
          <Route path="/compare" element={<Compare />} />
        </Routes>
      </main>
    </HashRouter>
  )
}
