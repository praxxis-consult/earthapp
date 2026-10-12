import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import About from '../pages/About'
import DashboardOverview from '../pages/Dashboard'
import Marketplace from '../pages/Marketplace'
import ProductDetail from '../pages/Marketplace/ProductDetail'
import PlaceOrder from '../pages/Marketplace/PlaceOrder'
import Signup from '../pages/Auth/Signup'
import SignupOtp from '../pages/Auth/SignupOtp'
import StoreName from '../pages/Onboarding/StoreName'
import Location from '../pages/Onboarding/Location'
import VerifyId from '../pages/Onboarding/VerifyId'
import BankDetails from '../pages/Onboarding/BankDetails'
import ReviewDetails from '../pages/Onboarding/ReviewDetails'
import NotFound from '../pages/NotFound'
import MainLayout from '../components/layout/MainLayout'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Standalone auth pages (no Navbar/Footer) */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/signup/verify" element={<SignupOtp />} />

      {/* Onboarding flow (no Navbar/Footer) */}
      <Route path="/onboarding/store" element={<StoreName />} />
      <Route path="/onboarding/location" element={<Location />} />
      <Route path="/onboarding/verify-id" element={<VerifyId />} />
      <Route path="/onboarding/bank" element={<BankDetails />} />
      <Route path="/onboarding/review" element={<ReviewDetails />} />

      {/* Dashboard (own layout: sidebar + topbar, no Navbar/Footer) */}
      <Route path="/dashboard" element={<DashboardOverview />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/marketplace/:id" element={<ProductDetail />} />
        <Route path="/marketplace/:id/order" element={<PlaceOrder />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
