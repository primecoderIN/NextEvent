import { useQuery } from "@tanstack/react-query"
import { axiosHttpAgent } from "@/shared/lib/axios"
import type { ApiResponse } from "@/types/ApiResponse"
import type { Organization } from "@/types/Organization"
import { useAuth } from "@/features/auth/context/AuthContext"

const fetchMyOrganization = async (): Promise<Organization> => {
  const res = await axiosHttpAgent.get<ApiResponse<Organization>>("/organizations/my")
  return res.data.data!
}

export const MY_ORGANIZATION_QUERY_KEY = ["myOrganization"] as const

export function useMyOrganization() {
  const { user } = useAuth()
  return useQuery({
    queryKey: MY_ORGANIZATION_QUERY_KEY,
    queryFn: fetchMyOrganization,
    enabled: !!user && user.activeProfile === "Organizer",
    retry: false, // Don't retry if it fails (e.g. 404 because user doesn't have an org)
  })
}
