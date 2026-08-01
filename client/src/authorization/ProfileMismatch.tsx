import { useNavigate } from "react-router-dom"
import { useAuth } from "@/features/auth/context/AuthContext"
import { Button } from "@/shared/ui/button"
import { RoutePaths } from "@/shared/constants/routePaths"
import { AlertCircle, RefreshCw, Plus, Home } from "lucide-react"
import { useTranslation } from "react-i18next"

interface ProfileMismatchProps {
  requiredProfiles: string[];
}

export function ProfileMismatch({ requiredProfiles }: ProfileMismatchProps) {
  const { user, switchProfile } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation("authGuard")

  if (!user) return null

  // Scenario A: Accessing Organizer route, but user doesn't own an org (only Member profile available)
  if (requiredProfiles.includes("Organizer") && !user.availableProfiles?.includes("Organizer")) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border/40 rounded-2xl p-8 text-center shadow-sm">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">{t("organizerAccessRequired")}</h2>
          <p className="text-muted-foreground mb-8">
            {t("organizerAccessSub")}
          </p>
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => navigate(RoutePaths.StartOrganizer)}
              className="w-full gap-2 bg-linear-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 text-white border-0"
            >
              <Plus className="w-4 h-4" />
              {t("becomeOrganizer")}
            </Button>
            <Button variant="outline" onClick={() => navigate(RoutePaths.Home)} className="w-full gap-2">
              <Home className="w-4 h-4" />
              {t("goHome")}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Scenario B: Accessing Organizer route, has Organizer available, but currently active as Member
  if (requiredProfiles.includes("Organizer") && user.activeProfile === "Member") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border/40 rounded-2xl p-8 text-center shadow-sm">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <RefreshCw className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">{t("switchProfileRequired")}</h2>
          <p className="text-muted-foreground mb-8">
            {t("switchProfileToOrganizer")}
          </p>
          <div className="flex flex-col gap-3">
            <Button 
              onClick={async () => {
                await switchProfile("Organizer")
                navigate(RoutePaths.OrganizerDashboard)
              }}
              className="w-full gap-2 bg-primary text-primary-foreground"
            >
              <RefreshCw className="w-4 h-4" />
              {t("switchToOrganizerMode")}
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)} className="w-full">
              {t("cancelAndGoBack")}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Scenario C: Accessing Member route, but active profile is Organizer
  if (requiredProfiles.includes("Member") && user.activeProfile === "Organizer") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border/40 rounded-2xl p-8 text-center shadow-sm">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <RefreshCw className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">{t("switchProfileRequired")}</h2>
          <p className="text-muted-foreground mb-8">
            {t("switchProfileToMember")}
          </p>
          <div className="flex flex-col gap-3">
            <Button 
              onClick={async () => {
                await switchProfile("Member")
                navigate(RoutePaths.Home)
              }}
              className="w-full gap-2 bg-primary text-primary-foreground"
            >
              <RefreshCw className="w-4 h-4" />
              {t("switchToMemberMode")}
            </Button>
            <Button variant="outline" onClick={() => navigate(RoutePaths.OrganizerDashboard)} className="w-full">
              {t("cancelAndStayOrganizer")}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Fallback if none match perfectly (shouldn't happen but good practice)
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">{t("accessDenied")}</h2>
        <Button onClick={() => navigate(RoutePaths.Home)}>{t("goHome")}</Button>
      </div>
    </div>
  )
}
