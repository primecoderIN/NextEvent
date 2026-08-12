import { useState } from "react"
import { User as UserIcon, CheckCircle, Clock } from "lucide-react"
import type { Organization } from "@/types/Organization"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { toast } from "sonner"
import { Input } from "@/shared/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/dialog"
import { useOrganizationMembersList, useUpdateOrganizationMemberRoles, useInviteOrganizationMember } from "@/shared/hooks/useOrganizationMembers"
import { useOrganizationRolesList } from "@/shared/hooks/useOrganizationRoles"
import { useAuthorization } from "@/authorization/useAuthorization"
import { Permissions } from "@/shared/constants/permissions"
import { useTranslation } from "react-i18next"

interface OrganizationMembersViewProps {
  organization: Organization;
}

export function OrganizationMembersView({ organization }: OrganizationMembersViewProps) {
  const { t } = useTranslation("organizer")
  const { data: members, isLoading: isLoadingMembers } = useOrganizationMembersList(organization.id)
  const { data: roles, isLoading: isLoadingRoles } = useOrganizationRolesList(organization.id)
  const { mutate: updateRoles, isPending: isUpdating } = useUpdateOrganizationMemberRoles()
  const { can } = useAuthorization()

  const canManageRoles = can(Permissions.OrganizationRolesManage)
  const canInviteMembers = can(Permissions.OrganizationMembersInvite)

  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [inviteEmail, setInviteEmail] = useState("")
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const { mutate: inviteMember, isPending: isInviting } = useInviteOrganizationMember()

  if (isLoadingMembers || isLoadingRoles) {
    return <div className="p-8 text-center text-muted-foreground">{t("loadingMembers")}</div>
  }

  const handleEditClick = (memberId: string, currentRoles: { id: string }[]) => {
    setEditingMemberId(memberId)
    setSelectedRoles(currentRoles.map(r => r.id))
  }

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    )
  }

  const handleSave = (memberId: string) => {
    updateRoles({ id: organization.id, memberId, roleIds: selectedRoles }, {
      onSuccess: () => {
        toast.success(t("rolesUpdatedSuccess"))
        setEditingMemberId(null)
      },
      onError: () => {
        toast.error(t("rolesUpdateFailed"))
      }
    })
  }

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail) return

    inviteMember({ id: organization.id, email: inviteEmail }, {
      onSuccess: () => {
        toast.success(t("inviteSuccess", { email: inviteEmail }))
        setInviteEmail("")
        setIsInviteOpen(false)
      },
      onError: (error) => {
        toast.error(t("inviteFailed") + ": " + (error.response?.data?.message || error.message))
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-primary" /> {t("membersTitle")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t("membersDesc")}
            </p>
          </div>
          
          {canInviteMembers && (
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
              <DialogTrigger asChild>
                <Button>{t("btnInviteMember")}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("inviteMemberTitle")}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleInvite} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("inviteEmailLabel")}</label>
                    <Input 
                      type="email" 
                      placeholder={t("inviteEmailPlaceholder")} 
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={() => setIsInviteOpen(false)} disabled={isInviting}>
                      {t("btnCancel")}
                    </Button>
                    <Button type="submit" disabled={isInviting || !inviteEmail}>
                      {isInviting ? t("inviting") : t("btnInvite")}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b">
              <tr>
                <th className="px-6 py-4 font-medium">{t("tableUser")}</th>
                <th className="px-6 py-4 font-medium">{t("tableStatus")}</th>
                <th className="px-6 py-4 font-medium">{t("tableRoles")}</th>
                <th className="px-6 py-4 font-medium text-right">{t("tableActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {members?.map(member => (
                <tr key={member.id} className="bg-card hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{member.userName}</div>
                    <div className="text-muted-foreground text-xs">{member.userEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={member.status === "Active" ? "default" : "outline"} className={
                      member.status === "Active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : ""
                    }>
                      {member.status === "Active" ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                      {member.status === "Active" ? t("statusActive") : t("statusPending")}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {editingMemberId === member.id ? (
                      <div className="flex flex-col gap-2">
                        {roles?.map(role => (
                          <label key={role.id} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="rounded border-input text-primary focus:ring-primary"
                              checked={selectedRoles.includes(role.id)}
                              onChange={() => handleRoleToggle(role.id)}
                              disabled={isUpdating}
                            />
                            <span>{role.name}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {member.roles.length > 0 ? (
                          member.roles.map(r => (
                            <Badge key={r.id} variant="secondary" className="text-xs">
                              {r.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground italic">{t("noRoles")}</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {canManageRoles && (
                      editingMemberId === member.id ? (
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setEditingMemberId(null)} disabled={isUpdating}>
                            {t("btnCancel")}
                          </Button>
                          <Button size="sm" onClick={() => handleSave(member.id)} disabled={isUpdating}>
                            {t("btnSave")}
                          </Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(member.id, member.roles)}>
                          {t("btnEditRoles")}
                        </Button>
                      )
                    )}
                  </td>
                </tr>
              ))}
              {members?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground italic">
                    {t("noMembersFound")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
