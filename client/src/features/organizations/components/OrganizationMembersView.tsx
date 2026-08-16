import { useState } from "react"
import { User as UserIcon, CheckCircle, Clock } from "lucide-react"
import type { Organization } from "@/types/Organization"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { toast } from "sonner"
import { Input } from "@/shared/ui/input"
import { Checkbox } from "@/shared/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { useOrganizationMembersList, useUpdateOrganizationMemberRoles, useInviteOrganizationMember } from "@/shared/hooks/useOrganizationMembers"
import { useOrganizationRolesList } from "@/shared/hooks/useOrganizationRoles"
import { Permissions } from "@/shared/constants/permissions"
import { useTranslation } from "react-i18next"

import { useOrganizationPermissions } from "@/shared/hooks/useOrganizationPermissions"

interface OrganizationMembersViewProps {
  organization: Organization;
}

export function OrganizationMembersView({ organization }: OrganizationMembersViewProps) {
  const { t } = useTranslation("organizer")
  const { data: members, isLoading: isLoadingMembers } = useOrganizationMembersList(organization.id)
  const { data: roles, isLoading: isLoadingRoles } = useOrganizationRolesList(organization.id)
  const { mutate: updateRoles, isPending: isUpdating } = useUpdateOrganizationMemberRoles()
  const { can } = useOrganizationPermissions(organization.id)

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
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>{t("tableUser")}</TableHead>
                <TableHead>{t("tableStatus")}</TableHead>
                <TableHead>{t("tableRoles")}</TableHead>
                <TableHead className="text-right">{t("tableActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members?.map(member => (
                <TableRow key={member.id} className="bg-card hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="font-medium">{member.userName}</div>
                    <div className="text-muted-foreground text-xs">{member.userEmail}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.status === "Active" ? "default" : "outline"} className={
                      member.status === "Active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : ""
                    }>
                      {member.status === "Active" ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                      {member.status === "Active" ? t("statusActive") : t("statusPending")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {editingMemberId === member.id ? (
                      <div className="flex flex-col gap-2">
                        {roles?.map(role => (
                          <label key={role.id} className="flex items-center gap-2 text-sm cursor-pointer">
                            <Checkbox
                              checked={selectedRoles.includes(role.id)}
                              onCheckedChange={() => handleRoleToggle(role.id)}
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
                  </TableCell>
                  <TableCell className="text-right">
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
                  </TableCell>
                </TableRow>
              ))}
              {members?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic">
                    {t("noMembersFound")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
