import type { Event } from "@/types/Event"
import { useAuth } from "@/features/auth/context/AuthContext"
import { PublicHomePage } from "@/app/(public)/home/PublicHomePage"
import { UserHomePage } from "@/app/(public)/home/UserHomePage"

interface HomePageProps {
  events: Event[]
  loading: boolean
  fetchNextPage?: () => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  )
}

/**
 * Thin authentication gate — only responsibility is to read auth state
 * and render the appropriate home experience. No business logic here.
 */
export function HomePage({
  events,
  loading,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: HomePageProps) {
  const { user, loading: authLoading } = useAuth()

  // Wait for auth to resolve before deciding which experience to show.
  // Prevents a flash of the wrong page on first load.
  if (authLoading) return <PageLoader />

  return user ? (
    <UserHomePage
      events={events}
      loading={loading}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
    />
  ) : (
    <PublicHomePage events={events} loading={loading} />
  )
}
