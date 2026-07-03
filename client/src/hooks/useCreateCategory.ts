import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosHttpAgent } from "@/lib/axios";
import { CategoryApiRoutes } from "@/constants/apiRoutes";
import { QueryKeys } from "@/constants/queryKeys";
import type { ApiResponse } from "@/Types/ApiResponse";
import type { Category } from "@/Types/Category";

interface CreateCategoryPayload {
  name: string;
  slug: string;
  description?: string;
}

const postCategory = async (payload: CreateCategoryPayload): Promise<Category> => {
  const res = await axiosHttpAgent.post<ApiResponse<Category>>(CategoryApiRoutes.Base, payload);
  return res.data.data!;
}

export function useCreateCategory() {
  const qc = useQueryClient();

  const mutation = useMutation<Category, unknown, CreateCategoryPayload>({
    mutationFn: postCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: QueryKeys.Categories }),
  });

  return {
    createCategory: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error as any,
  }
}
