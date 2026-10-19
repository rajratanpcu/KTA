import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Inventory from './pages/Inventory'
import Godowns from './pages/Godowns'
import Transfers from './pages/Transfers'
import Purchasing from './pages/Purchasing'
import Sales from './pages/Sales'
import Transport from './pages/Transport'
import TransportBills from './pages/TransportBills'
import Customers from './pages/Customers'
import Suppliers from './pages/Suppliers'
import Reports from './pages/Reports'
import Expenses from './pages/Expenses'
import Settings from './pages/Settings'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="godowns" element={<Godowns />} />
        <Route path="transfers" element={<Transfers />} />
        <Route path="purchasing" element={<Purchasing />} />
        <Route path="sales" element={<Sales />} />
        <Route path="transport" element={<Transport />} />
        <Route path="transport-bills" element={<TransportBills />} />
        <Route path="customers" element={<Customers />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="reports" element={<Reports />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
