import { Navigate, Outlet } from "react-router-dom"
import { Navbar } from "@/app/(public)/layouts/Navbar"
import { DesktopSidebar } from "@/app/(public)/layouts/DesktopSidebar"
import { RightSidebar } from "@/app/(public)/layouts/RightSidebar"
import { useEvents } from "@/shared/hooks/useEvents"
import { Roles } from "@/shared/constants/roles"
import { RoutePaths } from "@/shared/constants/routePaths"
import { useAuth } from "@/features/auth/context/AuthContext"

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
  const { user, loading } = useAuth()

  // While auth is resolving, keep layout stable to avoid shift
  const isAuthenticated = !loading && !!user

  return (
    <AdminRedirect>
      <div className="min-h-screen bg-background">
        {/* Left sidebar — only for authenticated users */}
        {isAuthenticated && <DesktopSidebar />}

        {/* Right sidebar — shown for all users on xl+ */}
        <RightSidebar events={events} />

        {/* Main content area
            - Authenticated: offset by left sidebar (lg:ml-56) + right sidebar (xl:mr-80)
            - Public: only offset by right sidebar (xl:mr-80), full-width on smaller screens */}
        <div
          className={`${
            isAuthenticated ? "lg:ml-56" : ""
          } xl:mr-80 flex flex-col min-h-screen`}
        >
          {/* Top navbar:
              - Authenticated: mobile only (desktop uses DesktopSidebar)
              - Public: always visible (no left sidebar on desktop) */}
          <div
            className={`${
              isAuthenticated ? "lg:hidden" : ""
            } sticky top-0 z-40`}
          >
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
