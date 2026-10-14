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
import Products from '../pages/Dashboard/Products'
import ProductsList from '../pages/Dashboard/ProductsList'
import DashboardProductDetail from '../pages/Dashboard/ProductDetail'
import AddProduct from '../pages/Dashboard/AddProduct'
import Orders from '../pages/Dashboard/Orders'
import OrderDetail from '../pages/Dashboard/OrderDetail'
import Messages from '../pages/Dashboard/Messages'
import Payout from '../pages/Dashboard/Payout'
import Referral from '../pages/Dashboard/Referral'
import Settings from '../pages/Dashboard/Settings'
import NotFound from '../pages/NotFound'
import MainLayout from '../components/layout/MainLayout'
import RequireAuth from '../auth/RequireAuth'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Standalone auth pages (no Navbar/Footer) */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/signup/verify" element={<SignupOtp />} />

      {/* Signed-in only: onboarding and the dashboard (no Navbar/Footer) */}
      <Route element={<RequireAuth />}>
        <Route path="/onboarding/store" element={<StoreName />} />
        <Route path="/onboarding/location" element={<Location />} />
        <Route path="/onboarding/verify-id" element={<VerifyId />} />
        <Route path="/onboarding/bank" element={<BankDetails />} />
        <Route path="/onboarding/review" element={<ReviewDetails />} />

        {/* Dashboard (own layout: sidebar + topbar, no Navbar/Footer) */}
        <Route path="/dashboard" element={<DashboardOverview />} />
        <Route path="/dashboard/products" element={<Products />} />
        <Route path="/dashboard/products/add" element={<AddProduct />} />
        <Route path="/dashboard/products/:id" element={<DashboardProductDetail />} />
        <Route path="/dashboard/products/:id/edit" element={<AddProduct />} />
        <Route path="/dashboard/products-list" element={<ProductsList />} />
        <Route path="/dashboard/orders" element={<Orders />} />
        <Route path="/dashboard/orders/:id" element={<OrderDetail />} />
        <Route path="/dashboard/messages" element={<Messages />} />
        <Route path="/dashboard/payout" element={<Payout />} />
        <Route path="/dashboard/referrals" element={<Referral />} />
        <Route path="/dashboard/settings" element={<Settings />} />
      </Route>

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
