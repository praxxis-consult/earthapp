import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import About from '../pages/About'
import Dashboard from '../pages/Dashboard'
import Marketplace from '../pages/Marketplace'
import ProductDetail from '../pages/Marketplace/ProductDetail'
import PlaceOrder from '../pages/Marketplace/PlaceOrder'
import Signup from '../pages/Auth/Signup'
import SignupOtp from '../pages/Auth/SignupOtp'
import NotFound from '../pages/NotFound'
import MainLayout from '../components/layout/MainLayout'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Standalone auth pages (no Navbar/Footer) */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/signup/verify" element={<SignupOtp />} />

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
