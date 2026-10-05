import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import About from '../pages/About'
import Dashboard from '../pages/Dashboard'
import Marketplace from '../pages/Marketplace'
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
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
