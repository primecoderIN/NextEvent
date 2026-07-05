import { useState } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, ArrowLeft, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getLoginFormSchema, type LoginFormValues } from "@/features/auth/types"
import { useAuth } from "@/features/auth/AuthContext"
import { FieldError } from "@/portals/organizer/pages/create-event/components"
import { RoutePaths } from "@/constants/routePaths"
import { Roles } from "@/constants/roles"
import { toast } from "sonner"

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation(["auth", "common"])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // React Compiler automatically memoizes the getLoginFormSchema(t) call
  // so the schema updates reactively when language changes.
  const schema = getLoginFormSchema(t)

  const methods = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  })

  const { login } = useAuth()

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = methods

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true)
    try {
      const loggedInUser = await login(values)
      toast.success("Logged in successfully!")
      // Admins always go to the admin dashboard.
      // Other users go to the page they were trying to reach, or home.
      if (loggedInUser.roles?.includes(Roles.Admin)) {
        navigate(RoutePaths.AdminDashboard, { replace: true })
      } else {
        const from = (location.state as { from?: Location })?.from?.pathname ?? RoutePaths.Home
        navigate(from, { replace: true })
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed")
    } finally {
      setIsSubmitting(false)
    }
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
          <h1 className="text-3xl font-bold tracking-tight">{t("login.title")}</h1>
          <p className="text-muted-foreground mt-2 text-sm">{t("login.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("login.emailLabel")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t("login.emailPlaceholder")}
                  className="pl-10"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
              </div>
              <FieldError msg={errors.email?.message} />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("login.passwordLabel")}</Label>
                <Link to="#" className="text-xs text-primary hover:underline font-medium">
                  {t("login.forgotPassword")}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder={t("login.passwordPlaceholder")}
                  className="pl-10"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
              </div>
              <FieldError msg={errors.password?.message} />
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
                {t("login.submitting")}
              </>
            ) : (
              t("login.submit")
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {t("login.noAccount")}{" "}
          <Link to={RoutePaths.Register} className="font-semibold text-primary hover:underline">
            {t("login.signUp")}
          </Link>
        </p>
      </div>
    </div>
  )
}
