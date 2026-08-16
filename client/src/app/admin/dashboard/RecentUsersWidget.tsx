import { UserPlus, Loader2 } from "lucide-react"
import { useUsers } from "@/shared/hooks/useUsers"

export function RecentUsersWidget() {
  const { data: usersPage, isLoading } = useUsers(1, 5)

  return (
    <div className="bg-card border border-border/40 rounded-2xl p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-blue-500" />
          Recent Registrations
        </h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : usersPage?.items && usersPage.items.length > 0 ? (
        <div className="space-y-3">
          {usersPage.items.map((user) => (
            <div 
              key={user.id}
              className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-primary">
                    {user.displayName?.charAt(0).toUpperCase() || user.userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">
                    {user.displayName || user.userName}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                {new Date(user.createdAtUtc).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-sm text-muted-foreground">
          No recent users.
        </div>
      )}
    </div>
  )
}
