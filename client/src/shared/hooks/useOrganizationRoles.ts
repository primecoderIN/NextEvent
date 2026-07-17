import { useMutation } from "@tanstack/react-query"
import { axiosHttpAgent } from "@/shared/lib/axios"
import type { ApiResponse } from "@/types/ApiResponse"
import type { CreateOrganizationRoleDto, UpdateOrganizationRoleDto } from "@/types/Organization"
import { OrganizationApiRoutes } from "@/shared/constants/apiRoutes"
import { type AxiosError } from "axios"

export const useCreateOrganizationRole = () => {
  return useMutation<
    unknown,
    AxiosError<ApiResponse<unknown>>,
    { id: string; payload: CreateOrganizationRoleDto }
  >({
    mutationFn: async ({ id, payload }) => {
      const res = await axiosHttpAgent.post<ApiResponse<unknown>>(
        OrganizationApiRoutes.Roles(id),
        payload
      )
      return res.data.data
    },
  })
}

export const useUpdateOrganizationRole = () => {
  return useMutation<
    unknown,
    AxiosError<ApiResponse<unknown>>,
    { id: string; roleId: string; payload: UpdateOrganizationRoleDto }
  >({
    mutationFn: async ({ id, roleId, payload }) => {
      const res = await axiosHttpAgent.put<ApiResponse<unknown>>(
        OrganizationApiRoutes.RoleUpdate(id, roleId),
        payload
      )
      return res.data.data
    },
  })
}
