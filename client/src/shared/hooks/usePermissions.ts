import { useQuery } from "@tanstack/react-query"
import { axiosHttpAgent } from "@/shared/lib/axios"
import type { ApiResponse } from "@/types/ApiResponse"
import type { PermissionDto } from "@/types/Permission"
import { PermissionApiRoutes } from "@/shared/constants/apiRoutes"

export const usePermissions = () => {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const res = await axiosHttpAgent.get<ApiResponse<PermissionDto[]>>(
        PermissionApiRoutes.Base
      )
      return res.data.data
    },
  })
}
