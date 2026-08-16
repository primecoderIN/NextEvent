import { Link } from "react-router-dom"
import { Building2, ChevronRight, Loader2 } from "lucide-react"
import { useOrganizations } from "@/shared/hooks/useOrganizations"

export function RecentOrganizationsWidget() {
  const { data: orgsPage, isLoading } = useOrganizations(1, 5)

  return (
    <div className="bg-card border border-border/40 rounded-2xl p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          Recent Organizations
        </h2>
        <Link 
          to="/admin/organizations" 
          className="text-xs font-medium text-primary hover:underline flex items-center"
        >
          View all
          <ChevronRight className="h-3 w-3 ml-0.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : orgsPage?.items && orgsPage.items.length > 0 ? (
        <div className="space-y-3">
          {orgsPage.items.map((org) => (
            <Link 
              key={org.id}
              to={`/admin/organizations?search=${org.slug}`}
              className="group flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/60 transition-colors"
            >
              <div className="flex flex-col min-w-0 pr-3">
                <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {org.name}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  @{org.slug}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-sm text-muted-foreground">
          No organizations found.
        </div>
      )}
    </div>
  )
}
