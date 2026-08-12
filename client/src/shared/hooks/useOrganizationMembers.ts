import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { axiosHttpAgent } from "@/shared/lib/axios"
import type { ApiResponse } from "@/types/ApiResponse"
import type { OrganizationMember } from "@/types/OrganizationMember"
import { OrganizationApiRoutes } from "@/shared/constants/apiRoutes"
import { type AxiosError } from "axios"

export const useOrganizationMembersList = (id: string) => {
  return useQuery<OrganizationMember[], AxiosError<ApiResponse<unknown>>>({
    queryKey: ["organization-members", id],
    queryFn: async () => {
      const res = await axiosHttpAgent.get<ApiResponse<OrganizationMember[]>>(
        OrganizationApiRoutes.Members(id)
      )
      return res.data.data ?? []
    },
    enabled: !!id,
  })
}

export const useUpdateOrganizationMemberRoles = () => {
  const queryClient = useQueryClient()
  return useMutation<
    unknown,
    AxiosError<ApiResponse<unknown>>,
    { id: string; memberId: string; roleIds: string[] }
  >({
    mutationFn: async ({ id, memberId, roleIds }) => {
      const res = await axiosHttpAgent.put<ApiResponse<unknown>>(
        OrganizationApiRoutes.MemberRoles(id, memberId),
        roleIds
      )
      return res.data.data
    },
    onSuccess: (_, { id }) => {
      // Invalidate the members list so it refetches with the updated roles
      queryClient.invalidateQueries({ queryKey: ["organization-members", id] })
    }
  })
}
