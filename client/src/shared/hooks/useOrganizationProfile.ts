import { useQuery } from "@tanstack/react-query"
import { axiosHttpAgent } from "@/shared/lib/axios"
import type { ApiResponse } from "@/types/ApiResponse"
import type { OrganizationPublicProfileDto } from "@/types/Organization"
import { OrganizationApiRoutes } from "@/shared/constants/apiRoutes"

export const useOrganizationProfile = (slug: string | undefined) => {
  return useQuery({
    queryKey: ["organizations", "profile", slug],
    queryFn: async () => {
      if (!slug) return null
      const res = await axiosHttpAgent.get<ApiResponse<OrganizationPublicProfileDto>>(
        OrganizationApiRoutes.Slug(slug)
      )
      return res.data.data
    },
    enabled: !!slug,
  })
}
