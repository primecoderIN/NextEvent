import { z } from "zod";
import type { TFunction } from "i18next";

export const getCreateCategorySchema = (t: TFunction<"admin">) =>
  z.object({
    name: z.string().min(1, { error: t("validation.nameRequired") }).max(200, { error: t("validation.nameMax") }),
    slug: z.string().min(1, { error: t("validation.slugRequired") }).regex(/^[a-z0-9-]+$/, { error: t("validation.slugFormat") }),
    description: z.string().max(2000, { error: t("validation.descriptionMax") }).optional(),
  });

export type CreateCategoryFormValues = z.infer<ReturnType<typeof getCreateCategorySchema>>;
