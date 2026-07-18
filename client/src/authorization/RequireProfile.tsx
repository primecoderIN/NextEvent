import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { ProfileMismatch } from "./ProfileMismatch";

interface RequireProfileProps {
  profile: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  redirectTo?: string;
  allowGuests?: boolean;
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

export function RequireProfile({
  profile,
  children,
  fallback = null,
  loadingFallback = <PageLoader />,
  redirectTo,
  allowGuests = false,
}: RequireProfileProps) {
  const location = useLocation();
  const { user, loading } = useAuth();
  
  const profiles = Array.isArray(profile) ? profile : [profile];

  if (loading) return <>{loadingFallback}</>;

  if (!user) {
    if (allowGuests) return <>{children}</>;
    if (redirectTo) return <Navigate to={redirectTo} state={{ from: location }} replace />;
    return null; // or render fallback if you want guests to see it
  }

  if (user && !profiles.includes(user.activeProfile || "Member")) {
    if (redirectTo && !user) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }
    return fallback ? <>{fallback}</> : <ProfileMismatch requiredProfiles={profiles} />;
  }

  return <>{children}</>;
}
