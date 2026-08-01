import { Building2, Globe, Mail, Phone, User, FileText, CheckCircle, Clock } from "lucide-react"
import type { Organization } from "@/types/Organization"
import { Badge } from "@/shared/ui/badge"

interface OrganizationDetailsViewProps {
  organization: Organization;
}

export function OrganizationDetailsView({ organization }: OrganizationDetailsViewProps) {
  return (
    <div className="space-y-6">
      {/* Pending Verification Banner */}
      {organization.status === "pending_verification" && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-4 text-amber-800 dark:text-amber-300">
          <Clock className="w-6 h-6 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div>
            <h3 className="font-semibold text-base">Organization Pending Approval</h3>
            <p className="text-sm mt-1 text-amber-700/90 dark:text-amber-300/90">
              Your organization <strong>{organization.name}</strong> is currently under review by our admin team. You can inspect your organization profile details below. Event creation will be enabled once your organization is verified.
            </p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="h-32 md:h-48 w-full bg-muted relative">
          {organization.coverImageUrl ? (
            <img 
              src={organization.coverImageUrl} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-primary/10 to-primary/5">
              <Building2 className="w-16 h-16 text-primary/20" />
            </div>
          )}
        </div>
        
        <div className="px-6 pb-6 md:px-8 relative">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12 sm:-mt-16">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl border-4 border-card bg-muted shadow-sm overflow-hidden shrink-0 flex items-center justify-center relative z-10">
              {organization.logoUrl ? (
                <img src={organization.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-10 h-10 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1 space-y-1 mb-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">{organization.name}</h1>
                <Badge variant={organization.status === "active" ? "default" : "outline"} className={
                  organization.status === "active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20" :
                  organization.status === "pending_verification" ? "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20" : ""
                }>
                  {organization.status === "active" ? <CheckCircle className="w-3 h-3 mr-1" /> : null}
                  {organization.status === "pending_verification" ? <Clock className="w-3 h-3 mr-1" /> : null}
                  {organization.status.replace("_", " ").toUpperCase()}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm flex items-center gap-1">
                <Globe className="w-4 h-4" /> /{organization.slug}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border shadow-sm p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" /> About Organization
            </h2>
            <div className="prose prose-sm dark:prose-invert text-muted-foreground">
              {organization.description ? (
                <p className="whitespace-pre-wrap">{organization.description}</p>
              ) : (
                <p className="italic">No description provided.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Meta */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl border shadow-sm p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Contact Info</h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="truncate">{organization.contactEmail || "Not provided"}</span>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <span>{organization.contactPhone || "Not provided"}</span>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <a href={organization.websiteUrl || "#"} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">
                  {organization.websiteUrl || "Not provided"}
                </a>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border shadow-sm p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">System Info</h2>
            <div className="space-y-4 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs">Organization ID</span>
                <span className="font-mono text-xs">{organization.id}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs">Owner Name</span>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{organization.ownerDisplayName || "Unknown"}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs">Owner User ID</span>
                <span className="font-mono text-xs">{organization.ownerUserId}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs">Created On</span>
                <span>{new Date(organization.createdAtUtc).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
