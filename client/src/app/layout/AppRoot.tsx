import { Outlet } from "react-router-dom"
import { Toaster } from "@/shared/ui/sonner"
import { AuthProvider } from "@/features/auth/context/AuthContext"
import { PermissionProvider } from "@/authorization"

export function AppRoot() {
  return (
    <AuthProvider>
      <PermissionProvider>
        <Toaster />
        <Outlet />
      </PermissionProvider>
    </AuthProvider>
  )
}
