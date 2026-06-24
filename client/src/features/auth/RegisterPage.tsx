import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, ArrowLeft, Mail, Lock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getRegisterFormSchema, type RegisterFormValues } from "@/features/auth/types"
import { FieldError } from "@/features/create-event/components"
import { toast } from "sonner"

export function RegisterPage() {
  const navigate = useNavigate()
  const { t } = useTranslation(["auth", "common"])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // React Compiler automatically memoizes this
  const schema = getRegisterFormSchema(t)

  const methods = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    mode: "onTouched",
  })

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = methods

  async function onSubmit(values: RegisterFormValues) {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    toast.success("Account created successfully!")
    navigate("/")
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 md:px-6 py-12">
      <div className="w-full max-w-md space-y-8 bg-background">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2 text-muted-foreground -ml-3 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t("back", { ns: "common" })}</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{t("register.title")}</h1>
          <p className="text-muted-foreground mt-2 text-sm">{t("register.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">{t("register.nameLabel")}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder={t("register.namePlaceholder")}
                  className="pl-10"
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
              </div>
              <FieldError msg={errors.name?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">{t("register.emailLabel")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t("register.emailPlaceholder")}
                  className="pl-10"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
              </div>
              <FieldError msg={errors.email?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">{t("register.passwordLabel")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder={t("register.passwordPlaceholder")}
                  className="pl-10"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
              </div>
              <FieldError msg={errors.password?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">{t("register.confirmPasswordLabel")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t("register.confirmPasswordPlaceholder")}
                  className="pl-10"
                  aria-invalid={!!errors.confirmPassword}
                  {...register("confirmPassword")}
                />
              </div>
              <FieldError msg={errors.confirmPassword?.message} />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-6 text-sm font-semibold shadow-lg"
            style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t("register.submitting")}
              </>
            ) : (
              t("register.submit")
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {t("register.hasAccount")}{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            {t("register.login")}
          </Link>
        </p>
      </div>
    </div>
  )
}
