import { Outlet } from "react-router-dom"
import { Roles } from "@/shared/constants/roles"
import { RoutePaths } from "@/shared/constants/routePaths"
import { ShieldOff } from "lucide-react"
import { RequireRole } from "@/authorization"

function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4 p-8">
      <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
        <ShieldOff className="h-8 w-8 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
      <p className="text-muted-foreground text-center max-w-sm">
        You don't have permission to access this page. Admin privileges are required.
      </p>
      <a
        href={RoutePaths.Home}
        className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        Back to Home
      </a>
    </div>
  )
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  )
}

/**
 * AdminRouteGuard — gates the entire /admin/* subtree.
 *
 * Behaviour:
 *  • While auth is loading → show a full-page spinner (avoids flash).
 *  • Unauthenticated → redirect to login (preserves intended destination).
 *  • Authenticated but not Admin → render 403 Unauthorized page.
 *  • Admin → render nested routes via <Outlet />.
 *
 * Because admin page lazy-imports only exist inside the <Outlet /> code-path,
 * Vite's code-splitting ensures their chunks are never downloaded by non-admins.
 */
export function AdminRouteGuard() {
  return (
    <RequireRole
      role={Roles.Admin}
      redirectTo={RoutePaths.Login}
      fallback={<UnauthorizedPage />}
      loadingFallback={<PageLoader />}
    >
      <Outlet />
    </RequireRole>
  )
}
