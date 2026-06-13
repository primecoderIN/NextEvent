import { Bell } from "lucide-react"
import { getGreeting } from "@/features/home/helpers"

interface GreetingHeaderProps {
  username: string
  notificationCount: number
}

export function GreetingHeader({
  username,
  notificationCount,
}: GreetingHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-muted-foreground text-sm font-medium">
          {getGreeting()}, {username} 👋
        </p>
        <h1 className="text-2xl md:text-3xl font-bold leading-tight mt-0.5">
          Discover amazing events
          <br className="hidden sm:block" />
          happening around you.
        </h1>
      </div>

      <div className="relative flex-shrink-0 ml-4">
        <button className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
          <Bell className="h-5 w-5" />
        </button>
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            {notificationCount}
          </span>
        )}
      </div>
    </div>
  )
}
