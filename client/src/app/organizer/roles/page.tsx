import { useState } from "react"
import { useParams } from "react-router-dom"
import { Shield, Plus, Key, Pencil, Save, X } from "lucide-react"
import { usePermissions } from "@/shared/hooks/usePermissions"
import { useCreateOrganizationRole, useUpdateOrganizationRole } from "@/shared/hooks/useOrganizationRoles"
import { Button } from "@/shared/ui/button"
import { toast } from "sonner"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"

export function OrganizerManageRolesPage() {
  const { id } = useParams<{ id: string }>()
  const { data: permissions, isLoading: isLoadingPermissions } = usePermissions()
  const createRoleMutation = useCreateOrganizationRole()
  const updateRoleMutation = useUpdateOrganizationRole()

  const [roleName, setRoleName] = useState("")
  const [roleDesc, setRoleDesc] = useState("")
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set())

  const [isCreating, setIsCreating] = useState(false)

  const togglePermission = (code: string) => {
    setSelectedPerms((prev) => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  const handleCreate = async () => {
    if (!id || !roleName.trim()) {
      toast.error("Role name is required")
      return
    }
    
    try {
      await createRoleMutation.mutateAsync({
        id,
        payload: {
          name: roleName,
          description: roleDesc,
          permissions: Array.from(selectedPerms),
        }
      })
      toast.success("Role created successfully")
      setIsCreating(false)
      setRoleName("")
      setRoleDesc("")
      setSelectedPerms(new Set())
    } catch {
      toast.error("Failed to create role")
    }
  }

  return (
    <div className="flex-1 p-6 overflow-auto max-w-5xl mx-auto w-full">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Shield className="h-4 w-4" />
            <span>Organizer / Organization Roles</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Roles</h1>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create Custom Role
          </Button>
        )}
      </div>

      {isCreating && (
        <div className="bg-card rounded-xl border p-6 mb-8 shadow-sm">
          <div className="flex justify-between items-center border-b pb-4 mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" /> Create New Role
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roleName">Role Name</Label>
                <Input
                  id="roleName"
                  placeholder="e.g. Event Manager"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roleDesc">Description</Label>
                <Input
                  id="roleDesc"
                  placeholder="What can this role do?"
                  value={roleDesc}
                  onChange={(e) => setRoleDesc(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4 mt-2">
              <h3 className="font-medium text-lg border-b pb-2">Select Permissions</h3>
              {isLoadingPermissions ? (
                <div className="text-muted-foreground text-sm">Loading permissions...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {permissions?.map((perm) => (
                    <div 
                      key={perm.id} 
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedPerms.has(perm.code) ? 'bg-primary/5 border-primary' : 'bg-muted/30 border-transparent hover:border-border'}`}
                      onClick={() => togglePermission(perm.code)}
                    >
                      <div className="mt-0.5">
                        <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${selectedPerms.has(perm.code) ? 'bg-primary border-primary text-primary-foreground' : 'border-input'}`}>
                          {selectedPerms.has(perm.code) && <CheckCircle className="w-3 h-3" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm leading-none mb-1.5">{perm.name}</div>
                        <div className="text-xs text-muted-foreground leading-tight">{perm.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end pt-4 mt-2 border-t">
              <Button 
                onClick={handleCreate} 
                disabled={createRoleMutation.isPending || !roleName.trim()}
              >
                {createRoleMutation.isPending ? "Creating..." : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Save Role
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Typically here we would list existing custom roles, 
          but there is no GET /api/organizations/{id}/roles endpoint in the backend right now 
          to retrieve custom roles list. We can just show a placeholder or notice. */}
      
      {!isCreating && (
        <div className="bg-muted/30 border rounded-xl p-8 text-center mt-6">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Custom Roles</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6 text-sm">
            You can create custom roles with specific permissions for your organization members.
          </p>
          <Button onClick={() => setIsCreating(true)} variant="outline">
            Create your first custom role
          </Button>
        </div>
      )}
    </div>
  )
}

function CheckCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
