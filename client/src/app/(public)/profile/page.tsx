import { useAuth } from "@/features/auth/context/AuthContext"
import { Navigate } from "react-router-dom"
import { RoutePaths } from "@/shared/constants/routePaths"
import { User, Mail, Shield, Calendar } from "lucide-react"
import { MyInvitationsView } from "@/features/organizations/components/MyInvitationsView"

export function ProfilePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to={RoutePaths.Login} replace />
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:px-6 md:py-12">
      <div className="bg-card rounded-2xl shadow-sm border p-6 md:p-10 space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border-4 border-background shadow-sm">
            <User className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{user.displayName || "User"}</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Mail className="h-4 w-4" />
              {user.email}
            </p>
          </div>
        </div>

        {/* Pending Invitations Section */}
        <MyInvitationsView />

        {/* Roles Section */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Your Roles
          </h2>
          {user.roles && user.roles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.roles.map(role => (
                <span 
                  key={role}
                  className="px-3 py-1 bg-primary/10 text-primary font-medium text-sm rounded-full"
                >
                  {role}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">You are a standard user.</p>
          )}
        </div>

        {/* Placeholder for future features */}
        <div className="pt-6 border-t border-border/50">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border border-dashed border-border/60">
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Account Settings & History</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Detailed profile management, ticket history, and preferences are coming soon.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
