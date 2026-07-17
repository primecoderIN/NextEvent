import { useState } from "react"
import { Building2, CheckCircle, Clock } from "lucide-react"
import { useOrganizations } from "@/shared/hooks/useOrganizations"
import { useApproveOrganization } from "@/shared/hooks/useApproveOrganization"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

export function AdminOrganizationsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const { data: orgsPage, isFetching } = useOrganizations(page, 10)
  const approveMutation = useApproveOrganization()

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id)
      toast.success("Organization approved successfully")
    } catch {
      toast.error("Failed to approve organization")
    }
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
          <Building2 className="h-4 w-4" />
          <span>Admin / Organizations</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Organizations</h1>
      </div>

      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-6 py-3 font-medium">Organization Name</th>
                <th className="px-6 py-3 font-medium">Owner</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Created</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isFetching ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                    Loading organizations...
                  </td>
                </tr>
              ) : orgsPage?.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                    No organizations found.
                  </td>
                </tr>
              ) : (
                orgsPage?.items.map((org) => (
                  <tr key={org.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{org.name}</td>
                    <td className="px-6 py-4">{org.ownerDisplayName || "Unknown"}</td>
                    <td className="px-6 py-4">
                      {org.status === "pending_verification" ? (
                        <Badge variant="outline" className="text-amber-600 bg-amber-500/10 border-amber-500/20">
                          <Clock className="w-3 h-3 mr-1" /> Pending
                        </Badge>
                      ) : org.status === "active" ? (
                        <Badge variant="outline" className="text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
                          <CheckCircle className="w-3 h-3 mr-1" /> Active
                        </Badge>
                      ) : (
                        <Badge variant="outline">{org.status}</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(org.createdAtUtc).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => navigate(`/admin/organizations/${org.id}`)}
                      >
                        View
                      </Button>
                      {org.status === "pending_verification" && (
                        <Button 
                          size="sm" 
                          onClick={() => handleApprove(org.id)}
                          disabled={approveMutation.isPending}
                        >
                          Approve
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
