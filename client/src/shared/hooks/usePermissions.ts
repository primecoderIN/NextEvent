import { useQuery } from "@tanstack/react-query"
import { axiosHttpAgent } from "@/shared/lib/axios"
import type { ApiResponse } from "@/types/ApiResponse"
import type { PermissionDto } from "@/types/Permission"
import { PermissionApiRoutes } from "@/shared/constants/apiRoutes"

export const usePermissions = (organizationId: string) => {
  return useQuery({
    queryKey: ["permissions", organizationId],
    queryFn: async () => {
      const res = await axiosHttpAgent.get<ApiResponse<PermissionDto[]>>(
        `${PermissionApiRoutes.Base}?organizationId=${organizationId}`
      )
      return res.data.data
    },
    enabled: !!organizationId
  })
}
