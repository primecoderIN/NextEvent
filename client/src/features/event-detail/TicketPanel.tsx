import { useState } from "react"
import type { Event } from "@/Types/Event"
import { Check, Plus, Minus, Shield } from "lucide-react"

interface TicketPanelProps {
  event: Event
}

interface TicketTier {
  name: string
  price: number
  badge?: string
  perks: string[]
}

const TIERS: TicketTier[] = [
  {
    name: "Early Bird",
    price: 999,
    badge: "Best Price",
    perks: ["Entry to the event", "Access to general zone"],
  },
  {
    name: "General Admission",
    price: 1499,
    perks: ["Entry to the event", "Access to general zone"],
  },
  {
    name: "VIP Pass",
    price: 2499,
    perks: ["Entry to the event", "VIP lounge access", "Food & beverage coupons"],
  },
]

export function TicketPanel({ event }: TicketPanelProps) {
  const [quantities, setQuantities] = useState<number[]>([1, 0, 0])

  const update = (i: number, delta: number) => {
    setQuantities((prev) =>
      prev.map((q, idx) => (idx === i ? Math.max(0, q + delta) : q))
    )
  }

  const earlyBirdEnds = new Date(event.date)
  earlyBirdEnds.setDate(earlyBirdEnds.getDate() - 7)

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/40">
        <h3 className="font-bold text-sm">Book Tickets</h3>
        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-2 py-1 rounded-lg">
          Early bird ends in 02d : 14h : 36m : 48s
        </span>
      </div>

      {/* Tiers */}
      <div className="divide-y divide-border/40">
        {TIERS.map((tier, i) => (
          <div key={tier.name} className="p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{tier.name}</span>
                  {tier.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                      {tier.badge}
                    </span>
                  )}
                </div>
                <ul className="mt-1 space-y-0.5">
                  {tier.perks.map((p) => (
                    <li key={p} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
                {i === 0 && (
                  <p className="text-[10px] text-red-500 font-medium mt-1">Only 120 tickets left!</p>
                )}
              </div>

              <div className="flex-shrink-0 text-right">
                <p className="font-bold text-sm">₹{tier.price.toLocaleString("en-IN")}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <button
                    onClick={() => update(i, -1)}
                    className="h-6 w-6 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors"
                    disabled={quantities[i] === 0}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-5 text-center text-xs font-semibold">{quantities[i]}</span>
                  <button
                    onClick={() => update(i, 1)}
                    className="h-6 w-6 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="p-4 border-t border-border/40">
        <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
          Book Now
        </button>
        <p className="flex items-center justify-center gap-1.5 mt-2 text-[11px] text-muted-foreground">
          <Shield className="h-3 w-3" />
          Secure checkout. Your data is protected.
        </p>
      </div>
    </div>
  )
}
