import { useMyInvitations, useAcceptOrganizationInvitation } from "@/shared/hooks/useOrganizationMembers"
import { Button } from "@/shared/ui/button"
import { toast } from "sonner"
import { Building2, Calendar, Check } from "lucide-react"
import { useAuth } from "@/features/auth/context/AuthContext"

export function MyInvitationsView() {
  const { data: invitations, isLoading } = useMyInvitations()
  const { mutate: acceptInvite, isPending } = useAcceptOrganizationInvitation()
  const { switchProfile } = useAuth()

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Checking for invitations...</div>
  }

  if (!invitations || invitations.length === 0) {
    return null
  }

  const handleAccept = (organizationId: string) => {
    acceptInvite(organizationId, {
      onSuccess: async () => {
        toast.success("Invitation accepted successfully!")
        try {
          await switchProfile("Organizer")
          toast.success("Switched to organization profile.")
        } catch (error) {
          toast.error("Failed to switch profile. Please refresh.")
        }
      },
      onError: (error) => {
        toast.error("Failed to accept invitation: " + (error.response?.data?.message || error.message))
      }
    })
  }

  return (
    <div className="space-y-4 mb-8">
      <h2 className="text-xl font-semibold tracking-tight">Pending Invitations</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {invitations.map((invite) => (
          <div key={invite.organizationId} className="bg-card rounded-xl border shadow-sm p-5 flex flex-col items-center text-center">
            {invite.organizationLogoUrl ? (
              <img src={invite.organizationLogoUrl} alt={invite.organizationName} className="w-16 h-16 rounded-full object-cover mb-4 border" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 border">
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <h3 className="font-medium text-lg mb-1">{invite.organizationName}</h3>
            <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Invited on {new Date(invite.invitedAtUtc).toLocaleDateString()}
            </p>
            <Button 
              className="w-full mt-auto" 
              onClick={() => handleAccept(invite.organizationId)}
              disabled={isPending}
            >
              <Check className="w-4 h-4 mr-2" />
              {isPending ? "Accepting..." : "Accept Invitation"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
