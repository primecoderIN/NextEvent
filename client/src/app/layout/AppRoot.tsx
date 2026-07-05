import { Outlet } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/features/auth/AuthContext"

export function AppRoot() {
  return (
    <AuthProvider>
      <Toaster />
      <Outlet />
    </AuthProvider>
  )
}
