import { useQuery } from "@tanstack/react-query"
import { axiosHttpAgent } from "@/shared/lib/axios"
import type { ApiResponse } from "@/types/ApiResponse"
import type { Permission } from "@/authorization/types"

export const useOrganizationPermissions = (organizationId?: string) => {
  const { data: permissions, isLoading, isError } = useQuery<string[]>({
    queryKey: ["organization-permissions", organizationId],
    queryFn: async () => {
      const res = await axiosHttpAgent.get<ApiResponse<string[]>>(
        `/organizations/${organizationId}/my-permissions`
      )
      return res.data.data ?? []
    },
    enabled: !!organizationId,
    staleTime: 10 * 60 * 1000, // 10 minutes: prevents refetching on every component mount
  })

  // The 'can' function strictly evaluates if the user has the permission in the array.
  // No global system roles (like Admin) override this at the organization level.
  const can = (permission: Permission): boolean => {
    if (!permissions) return false;
    return permissions.includes(permission);
  }

  return { permissions: permissions ?? [], can, isLoading, isError }
}
