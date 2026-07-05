import { useQuery } from "@tanstack/react-query"
import { axiosHttpAgent } from "@/shared/lib/axios"
import type { Category } from "@/types/Category"
import type { ApiResponse } from "@/types/ApiResponse"

import { CategoryApiRoutes } from "@/shared/constants/apiRoutes"
import { QueryKeys } from "@/shared/constants/queryKeys"

export const CATEGORIES_QUERY_KEY = QueryKeys.Categories

export const fetchCategories = async (): Promise<Category[]> => {
  const response = await axiosHttpAgent.get<ApiResponse<Category[]>>(CategoryApiRoutes.Base)
  return response.data.data ?? []
}

export function useCategories() {
  const query = useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: fetchCategories,
  })

  return query
}
