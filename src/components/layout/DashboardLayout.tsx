import { useCallback, useState, type ReactNode } from 'react'
import Drawer from '../ui/Drawer'
import DashboardSidebar from './DashboardSidebar'
import DashboardTopbar from './DashboardTopbar'

interface DashboardLayoutProps {
  children: ReactNode
}

/**
 * The dashboard frame (431:4736): the 299px sidebar, the 96px topbar and the scrolling page.
 * Below `lg` the sidebar leaves the flow and opens from the topbar's menu button as a drawer,
 * which closes when a link is chosen, on Escape or on the backdrop.
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const close = useCallback(() => setMenuOpen(false), [])

  return (
    <div className="flex h-screen max-lg:h-dvh overflow-hidden bg-[#f7f7f7]">
      <div className="max-lg:hidden flex shrink-0">
        <DashboardSidebar />
      </div>
      <Drawer open={menuOpen} onClose={close} label="Dashboard menu" className="w-[299px]">
        <DashboardSidebar inDrawer onClose={close} />
      </Drawer>
      <div className="flex flex-col flex-1 min-w-0">
        <DashboardTopbar onMenu={() => setMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
