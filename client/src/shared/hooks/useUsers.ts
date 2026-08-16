import { useQuery } from "@tanstack/react-query"
import { axiosHttpAgent } from "@/shared/lib/axios"
import type { ApiResponse } from "@/types/ApiResponse"
import type { PagedList } from "@/types/PagedList"

export interface UserDto {
  id: string
  userName: string
  email: string
  displayName?: string
  imageUrl?: string
  createdAtUtc: string
}

export const useUsers = (pageNumber = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ["users", pageNumber, pageSize],
    queryFn: async () => {
      const res = await axiosHttpAgent.get<ApiResponse<PagedList<UserDto>>>(
        `/users?PageNumber=${pageNumber}&PageSize=${pageSize}`
      )
      return res.data.data
    },
  })
}
