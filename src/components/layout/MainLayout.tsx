import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
