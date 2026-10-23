import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function MainLayout() {
  return (
    <div>
      <Navbar />
      <main className="relative z-0">
        <Outlet />
      </main>
      {/* Footer sits above the preceding section (higher z) so it can overlap it. The overlap
          itself is driven on scroll by the last section pinning against it (see Newsletter). */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  )
}
