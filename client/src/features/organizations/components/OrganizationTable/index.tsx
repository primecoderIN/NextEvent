import { Link } from "react-router-dom"
import { Eye, ShieldCheck, Clock, CheckCircle, Ban } from "lucide-react"

import type { Organization } from "@/types/Organization"

interface OrganizationTableProps {
  organizations: Organization[]
  isFetching: boolean
  onApprove: (id: string) => void
  isApproving: boolean
}

export function OrganizationTable({ organizations, isFetching, onApprove, isApproving }: OrganizationTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/40 bg-muted/30">
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Organization</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Owner</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Created</th>
            <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className={`divide-y divide-border/30 transition-opacity duration-150 ${isFetching ? "opacity-60" : "opacity-100"}`}>
          {organizations.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                {isFetching ? "Loading…" : "No organizations found."}
              </td>
            </tr>
          ) : (
            organizations.map((org) => {
              const initials = org.name.substring(0, 2).toUpperCase()
              const createdDate = new Date(org.createdAtUtc).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric'
              })

              return (
                <tr key={org.id} className="hover:bg-muted/30 transition-colors group border-l-4 border-l-transparent">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden text-primary font-bold">
                        {initials}
                      </div>
                      <div>
                        <p className="font-semibold leading-tight group-hover:text-primary transition-colors">
                          {org.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-48" title={org.slug}>
                          @{org.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <p className="text-foreground font-medium">{org.ownerDisplayName || "Unknown"}</p>
                    <p className="text-xs truncate max-w-48" title={org.contactEmail || ""}>{org.contactEmail || "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    {org.status === "pending_verification" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        <Clock className="h-3 w-3" />
                        Pending
                      </span>
                    )}
                    {org.status === "active" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <CheckCircle className="h-3 w-3" />
                        Active
                      </span>
                    )}
                    {org.status === "suspended" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
                        <Ban className="h-3 w-3" />
                        Suspended
                      </span>
                    )}
                    {org.status === "rejected" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border/50">
                        <Ban className="h-3 w-3" />
                        Rejected
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {createdDate}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/organizations/${org.id}`}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="View Organization Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      
                      {org.status === "pending_verification" && (
                        <button
                          onClick={() => onApprove(org.id)}
                          disabled={isApproving}
                          className="inline-flex items-center justify-center gap-1.5 w-28 py-1.5 text-xs font-medium rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Approve Organization"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Approve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
