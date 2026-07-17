import { useQuery } from "@tanstack/react-query"
import { axiosHttpAgent } from "@/shared/lib/axios"
import type { ApiResponse } from "@/types/ApiResponse"
import type { PagedList } from "@/types/PagedList"
import type { Organization } from "@/types/Organization"
import { OrganizationApiRoutes } from "@/shared/constants/apiRoutes"

export const useOrganizations = (pageNumber = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ["organizations", pageNumber, pageSize],
    queryFn: async () => {
      const res = await axiosHttpAgent.get<ApiResponse<PagedList<Organization>>>(
        `${OrganizationApiRoutes.Base}?PageNumber=${pageNumber}&PageSize=${pageSize}`
      )
      return res.data.data
    },
  })
}
