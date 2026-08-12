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

export const useInviteOrganizationMember = () => {
  const queryClient = useQueryClient()
  return useMutation<
    unknown,
    AxiosError<ApiResponse<unknown>>,
    { id: string; email: string }
  >({
    mutationFn: async ({ id, email }) => {
      const res = await axiosHttpAgent.post<ApiResponse<unknown>>(
        OrganizationApiRoutes.MemberInvite(id),
        { email }
      )
      return res.data.data
    },
    onSuccess: (_, { id }) => {
      // Invalidate the members list to show the new invited member
      queryClient.invalidateQueries({ queryKey: ["organization-members", id] })
    }
  })
}

export interface OrganizationInvitation {
  organizationId: string;
  organizationName: string;
  organizationLogoUrl: string | null;
  invitedAtUtc: string;
}

export const useMyInvitations = () => {
  return useQuery<OrganizationInvitation[], AxiosError>({
    queryKey: ["my-invitations"],
    queryFn: async () => {
      const res = await axiosHttpAgent.get<ApiResponse<OrganizationInvitation[]>>(
        OrganizationApiRoutes.MyInvitations
      )
      return res.data.data!
    }
  })
}

export const useAcceptOrganizationInvitation = () => {
  const queryClient = useQueryClient()
  return useMutation<
    unknown,
    AxiosError<ApiResponse<unknown>>,
    string // organizationId
  >({
    mutationFn: async (organizationId) => {
      const res = await axiosHttpAgent.post<ApiResponse<unknown>>(
        OrganizationApiRoutes.AcceptInvite(organizationId)
      )
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-invitations"] })
      queryClient.invalidateQueries({ queryKey: ["my-organization"] })
    }
  })
}
