import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import About from '../pages/About'
import Dashboard from '../pages/Dashboard'
import Marketplace from '../pages/Marketplace'
import ProductDetail from '../pages/Marketplace/ProductDetail'
import PlaceOrder from '../pages/Marketplace/PlaceOrder'
import NotFound from '../pages/NotFound'
import MainLayout from '../components/layout/MainLayout'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/marketplace/:id" element={<ProductDetail />} />
        <Route path="/marketplace/:id/order" element={<PlaceOrder />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
