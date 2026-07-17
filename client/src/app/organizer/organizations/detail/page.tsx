import { useParams, useNavigate } from "react"
import { useOrganizationDetail } from "@/shared/hooks/useOrganizationDetail"
import { Building2, ArrowLeft, Shield } from "lucide-react"
import { OrganizationDetailsView } from "@/features/organizations/components/OrganizationDetailsView"
import { Button } from "@/shared/ui/button"

export function OrganizerOrganizationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: organization, isLoading, isError } = useOrganizationDetail(id)

  if (isLoading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (isError || !organization) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
        <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Organization Not Found</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          The requested organization could not be found or you do not have permission to view it.
        </p>
        <Button onClick={() => navigate("/organizer/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 overflow-auto max-w-7xl mx-auto w-full">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/organizer/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Building2 className="h-4 w-4" />
              <span>Organizer / Organization Details</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Organization Profile</h1>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/organizer/organizations/${id}/roles`)}>
            <Shield className="w-4 h-4 mr-2" />
            Manage Roles
          </Button>
        </div>
      </div>

      <OrganizationDetailsView organization={organization} />
    </div>
  )
}
