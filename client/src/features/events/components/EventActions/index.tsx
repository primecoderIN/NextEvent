import { useNavigate } from "react-router-dom"
import { Pencil, Trash2, Ban, Eye } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { RequirePermission } from "@/authorization"
import { RoutePaths } from "@/shared/constants/routePaths"
import { Permissions } from "@/shared/constants/permissions"
import type { Event } from "@/types/Event"

interface ActionProps {
  event: Event
  iconOnly?: boolean
  label?: string
  onClick?: () => void
  className?: string
}

export function EventEditAction({ event, iconOnly, label = "Edit", onClick, className }: ActionProps) {
  const navigate = useNavigate()
  return (
    <RequirePermission permission={Permissions.EventsUpdate} resource={event}>
      <Button
        variant="outline"
        size={iconOnly ? "icon" : "sm"}
        className={className || "gap-2 border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/60"}
        onClick={() => {
          if (onClick) onClick()
          else navigate(RoutePaths.EventEditLink(event.id))
        }}
        title={label}
      >
        <Pencil className="h-4 w-4" />
        {!iconOnly && label}
      </Button>
    </RequirePermission>
  )
}

export function EventDeleteAction({ event, iconOnly, label = "Delete", onClick, className }: ActionProps) {
  return (
    <RequirePermission permission={Permissions.EventsCancel} resource={event}>
      <Button
        variant="outline"
        size={iconOnly ? "icon" : "sm"}
        className={className || "gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive/60"}
        onClick={onClick}
        title={label}
      >
        <Trash2 className="h-4 w-4" />
        {!iconOnly && label}
      </Button>
    </RequirePermission>
  )
}

export function EventBanAction({ event, iconOnly, label = "Ban", onClick, className }: ActionProps) {
  return (
    <RequirePermission permission={Permissions.EventsBan} resource={event}>
      <Button
        variant="outline"
        size={iconOnly ? "icon" : "sm"}
        className={className || "gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive/60"}
        onClick={onClick}
        title={label}
      >
        <Ban className="h-4 w-4" />
        {!iconOnly && label}
      </Button>
    </RequirePermission>
  )
}

export function EventViewAction({ event, iconOnly, label = "View", onClick, className }: ActionProps) {
  const navigate = useNavigate()
  return (
    <Button
      variant="outline"
      size={iconOnly ? "icon" : "sm"}
      className={className || "gap-2 border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/60"}
      onClick={() => {
        if (onClick) onClick()
        else navigate(RoutePaths.EventDetailLink(event.id))
      }}
      title={label}
    >
      <Eye className="h-4 w-4" />
      {!iconOnly && label}
    </Button>
  )
}
