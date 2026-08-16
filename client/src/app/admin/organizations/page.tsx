import { Building2, Download, Search, Filter } from "lucide-react"
import { useOrganizations } from "@/shared/hooks/useOrganizations"
import { useApproveOrganization } from "@/shared/hooks/useApproveOrganization"
import { toast } from "sonner"
import { OrganizationTable } from "@/features/organizations/components/OrganizationTable"
import { Input } from "@/shared/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"

export function AdminOrganizationsPage() {
  const page = 1
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
    <div className="flex-1 p-8 overflow-auto bg-background/50">
      {/* Header section with gradient */}
      <div className="mb-8 p-6 rounded-2xl border bg-gradient-to-r from-card to-card/50 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
        
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <Building2 className="h-4 w-4" />
              <span>Admin / Organizations</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor all organizations across the platform.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-card border hover:bg-accent transition-colors shadow-sm"
            >
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 shadow-md"
              style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }}
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input 
            type="text"
            placeholder="Search organizations by name or email..."
            className="w-full pl-9 h-10 bg-card rounded-xl shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="">
            <SelectTrigger className="w-[180px] h-10 bg-card rounded-xl shadow-sm">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending_verification">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <OrganizationTable 
          organizations={orgsPage?.items || []} 
          isFetching={isFetching}
          onApprove={handleApprove}
          isApproving={approveMutation.isPending}
        />
      </div>
    </div>
  )
}
