import { z } from "zod"
import type { TFunction } from "i18next"

export interface UserDTO {
  displayName: string;
  token: string;
  email: string;
}

export interface UserDTOWithRoles extends UserDTO {
  roles?: string[];
}

export const getLoginFormSchema = (t: TFunction<"auth">) =>
  z.object({
    email: z
      .string()
      .min(1, { error: t("validation.emailRequired") })
      .email({ error: t("validation.emailInvalid") }),
    password: z
      .string()
      .min(1, { error: t("validation.passwordRequired") })
      .min(6, { error: t("validation.passwordMin") }),
  })

export type LoginFormValues = z.infer<ReturnType<typeof getLoginFormSchema>>

export const getRegisterFormSchema = (t: TFunction<"auth">) =>
  z
    .object({
      name: z
        .string()
        .min(1, { error: t("validation.nameRequired") })
        .min(2, { error: t("validation.nameMin") }),
      email: z
        .string()
        .min(1, { error: t("validation.emailRequired") })
        .email({ error: t("validation.emailInvalid") }),
      password: z
        .string()
        .min(1, { error: t("validation.passwordRequired") })
        .min(6, { error: t("validation.passwordMin") }),
      confirmPassword: z
        .string()
        .min(1, { error: t("validation.confirmPasswordRequired") }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.passwordMismatch"),
      path: ["confirmPassword"],
    })

export type RegisterFormValues = z.infer<ReturnType<typeof getRegisterFormSchema>>
