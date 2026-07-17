import { useQuery } from "@tanstack/react-query"
import { axiosHttpAgent } from "@/shared/lib/axios"
import type { ApiResponse } from "@/types/ApiResponse"
import type { PagedList } from "@/types/PagedList"
import type { Event } from "@/types/Event"

export type EventStatusFilter = "all" | "published" | "unpublished" | "reported"

interface UseAdminEventsParams {
  page?: number
  pageSize?: number
  search?: string
  status?: EventStatusFilter
  categoryId?: string
}

const fetchAdminEvents = async ({
  page = 1,
  pageSize = 8,
  search = "",
  status = "all",
  categoryId = "",
}: UseAdminEventsParams): Promise<PagedList<Event>> => {
  const params = new URLSearchParams({
    pageNumber: String(page),
    pageSize: String(pageSize),
  })
  if (search) params.set("search", search)
  if (status !== "all") params.set("status", status)
  if (categoryId) params.set("categoryId", categoryId)

  const res = await axiosHttpAgent.get<ApiResponse<PagedList<Event>>>(
    `/events/admin?${params.toString()}`
  )
  return res.data.data!
}

export const ADMIN_EVENTS_QUERY_KEY = (params: UseAdminEventsParams) =>
  ["admin", "events", params] as const

export function useAdminEvents(params: UseAdminEventsParams = {}) {
  return useQuery({
    queryKey: ADMIN_EVENTS_QUERY_KEY(params),
    queryFn: () => fetchAdminEvents(params),
    placeholderData: (prev) => prev,
  })
}
