import { useQuery, useInfiniteQuery } from "@tanstack/react-query"
import { axiosHttpAgent } from "@/shared/lib/axios"
import type { ApiResponse } from "@/types/ApiResponse"
import type { PagedList } from "@/types/PagedList"
import type { Event } from "@/types/Event"

export type EventStatusFilter = "all" | "published" | "unpublished" | "reported"

interface UseAdminEventsParams {
  page?: number
  pageSize?: number
  q?: string
  status?: EventStatusFilter
  categoryId?: string
  city?: string
  dateFrom?: string
  dateTo?: string
  organizationId?: string
}

const fetchAdminEvents = async ({
  page = 1,
  pageSize = 8,
  q = "",
  status = "all",
  categoryId = "",
  city = "",
  dateFrom = "",
  dateTo = "",
  organizationId = "",
}: UseAdminEventsParams): Promise<PagedList<Event>> => {
  const params = new URLSearchParams({
    pageNumber: String(page),
    pageSize: String(pageSize),
  })
  if (q) params.set("Q", q)
  // Backend swagger might not explicitly show status, but if we need it we can keep it as is, or maybe backend doesn't support it yet. I'll pass it if not 'all' just in case.
  if (status !== "all") params.set("status", status)
  if (categoryId && categoryId !== "all") params.set("CategoryId", categoryId)
  if (city) params.set("City", city)
  if (dateFrom) params.set("DateFrom", dateFrom)
  if (dateTo) params.set("DateTo", dateTo)
  if (organizationId && organizationId !== "all") params.set("OrganizationId", organizationId)

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

export function useInfiniteAdminEvents(params: Omit<UseAdminEventsParams, "page"> = {}) {
  return useInfiniteQuery({
    queryKey: ["infinite", ...ADMIN_EVENTS_QUERY_KEY(params)],
    queryFn: ({ pageParam = 1 }) => fetchAdminEvents({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.currentPage < lastPage.totalPages ? allPages.length + 1 : undefined
    },
  })
}
