import { Shield, Ticket, Users } from "lucide-react"

const FEATURES = [
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "Your data is protected with top security.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Ticket,
    title: "Easy Ticketing",
    description: "Book tickets easily and securely.",
    color: "text-violet-600",
    bg: "bg-violet-500/10",
  },
  {
    icon: Users,
    title: "Connect & Network",
    description: "Meet people with similar interests.",
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
  },
]

/**
 * Trust/feature bar shown at the bottom of the public landing page.
 * Maps to the 3-column row in the design: Safe & Secure · Easy Ticketing · Connect & Network.
 */
export function TrustBar() {
  return (
    <section className="border-t border-border/40 pt-8 pb-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {FEATURES.map(({ icon: Icon, title, description, color, bg }) => (
          <div key={title} className="flex items-start gap-4">
            <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <p className={`font-semibold text-sm ${color}`}>{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
