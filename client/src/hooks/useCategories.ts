import { useQuery } from "@tanstack/react-query"
import { axiosHttpAgent } from "@/lib/axios"
import type { Category } from "@/Types/Category"
import type { ApiResponse } from "@/Types/ApiResponse"

import { CategoryApiRoutes } from "@/constants/apiRoutes"
import { QueryKeys } from "@/constants/queryKeys"

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
