import { useMutation, useQueryClient } from "@tanstack/react-query"
import { axiosHttpAgent } from "@/shared/lib/axios"
import type { ApiResponse } from "@/types/ApiResponse"
import { OrganizationApiRoutes } from "@/shared/constants/apiRoutes"
import { type AxiosError } from "axios"

export const useApproveOrganization = () => {
  const queryClient = useQueryClient()

  return useMutation<
    unknown,
    AxiosError<ApiResponse<unknown>>,
    string
  >({
    mutationFn: async (id: string) => {
      const res = await axiosHttpAgent.post<ApiResponse<unknown>>(
        OrganizationApiRoutes.Approve(id)
      )
      return res.data.data
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] })
      queryClient.invalidateQueries({ queryKey: ["organizations", "detail", id] })
    },
  })
}
