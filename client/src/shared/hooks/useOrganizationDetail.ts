import { useQuery } from "@tanstack/react-query"
import { axiosHttpAgent } from "@/shared/lib/axios"
import type { ApiResponse } from "@/types/ApiResponse"
import type { Organization } from "@/types/Organization"
import { OrganizationApiRoutes } from "@/shared/constants/apiRoutes"

export const useOrganizationDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ["organizations", "detail", id],
    queryFn: async () => {
      if (!id) return null
      const res = await axiosHttpAgent.get<ApiResponse<Organization>>(
        OrganizationApiRoutes.Id(id)
      )
      return res.data.data
    },
    enabled: !!id,
  })
}
