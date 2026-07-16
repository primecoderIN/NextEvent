import { useMutation, useQueryClient } from "@tanstack/react-query"
import { axiosHttpAgent } from "@/shared/lib/axios"
import type { ApiResponse } from "@/types/ApiResponse"
import type { Organization, CreateOrganizationDto } from "@/types/Organization"

export function useCreateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateOrganizationDto) => {
      const res = await axiosHttpAgent.post<ApiResponse<Organization>>("/organizations", payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] })
    }
  })
}
