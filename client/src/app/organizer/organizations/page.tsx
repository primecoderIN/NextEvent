import { useNavigate } from "react-router-dom"
import { useMyOrganization } from "@/shared/hooks/useMyOrganization"
import { Building2, Shield, CalendarPlus } from "lucide-react"
import { OrganizationDetailsView } from "@/features/organizations/components/OrganizationDetailsView"
import { OrganizationMembersView } from "@/features/organizations/components/OrganizationMembersView"
import { Button } from "@/shared/ui/button"
import { RequirePermission } from "@/authorization"
import { Permissions } from "@/shared/constants/permissions"
import { RoutePaths } from "@/shared/constants/routePaths"

export function OrganizerMyOrganizationPage() {
  const navigate = useNavigate()
  const { data: organization, isLoading, isError } = useMyOrganization()

  if (isLoading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (isError || !organization) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
        <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Organization Found</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          You don't have an organization set up yet. Create an organization profile to get started!
        </p>
        <Button onClick={() => navigate(RoutePaths.StartOrganizer)}>
          <CalendarPlus className="w-4 h-4 mr-2" />
          Create Organization
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 overflow-auto max-w-7xl mx-auto w-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Building2 className="h-4 w-4" />
            <span>Organizer / My Organization</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Organization Profile</h1>
        </div>
        
        <div className="flex gap-2">
          {organization.status === "active" && (
            <RequirePermission permission={Permissions.OrganizationRolesManage}>
              <Button variant="outline" onClick={() => navigate(`/organizer/organizations/${organization.id}/roles`)}>
                <Shield className="w-4 h-4 mr-2" />
                Manage Roles
              </Button>
            </RequirePermission>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <OrganizationDetailsView organization={organization} />
        <OrganizationMembersView organization={organization} />
      </div>
    </div>
  )
}
