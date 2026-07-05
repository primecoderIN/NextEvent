import { Navigate, Outlet } from "react-router-dom"
import { Navbar } from "@/portals/public/layouts/Navbar"
import { DesktopSidebar } from "@/portals/public/layouts/DesktopSidebar"
import { RightSidebar } from "@/portals/public/layouts/RightSidebar"
import { useEvents } from "@/hooks/useEvents"
import { Roles } from "@/constants/roles"
import { RoutePaths } from "@/constants/routePaths"
import { useAuth } from "@/features/auth/AuthContext"

function AdminRedirect({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user?.roles?.includes(Roles.Admin)) {
    return <Navigate to={RoutePaths.AdminDashboard} replace />
  }
  return <>{children}</>
}

export function PublicLayout() {
  const { events } = useEvents()

  return (
    <AdminRedirect>
      <div className="min-h-screen bg-background">
        {/* Desktop left sidebar — fixed */}
        <DesktopSidebar />

        {/* Desktop right sidebar — fixed */}
        <RightSidebar events={events} />

        {/* Main content area */}
        <div className="lg:ml-56 xl:mr-80 flex flex-col min-h-screen">
          {/* Mobile top navbar */}
          <div className="lg:hidden sticky top-0 z-40">
            <Navbar />
          </div>

          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminRedirect>
  )
}
