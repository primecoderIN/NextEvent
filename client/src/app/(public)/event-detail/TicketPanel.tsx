import { useState } from "react"

import { useTranslation } from "react-i18next"
import type { Event } from "@/types/Event"
import { Check, Plus, Minus, Shield } from "lucide-react"
import { Button } from "@/shared/ui/button"

interface TicketPanelProps {
  event: Event
}

interface TicketTier {
  tierKey: string
  price: number
  badgeKey?: string
  perks: string[]
}

const TIERS: TicketTier[] = [
  {
    tierKey: "earlyBird",
    price: 999,
    badgeKey: "bestPrice",
    perks: ["entry", "generalZone"],
  },
  {
    tierKey: "generalAdmission",
    price: 1499,
    perks: ["entry", "generalZone"],
  },
  {
    tierKey: "vipPass",
    price: 2499,
    perks: ["entry", "vipLounge", "foodCoupons"],
  },
]

export function TicketPanel(_props: TicketPanelProps) {
  const [quantities, setQuantities] = useState<number[]>([1, 0, 0])
  const { t } = useTranslation(["eventDetail", "common"])

  const update = (i: number, delta: number) => {
    setQuantities((prev) =>
      prev.map((q, idx) => (idx === i ? Math.max(0, q + delta) : q))
    )
  }



  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/40">
        <h3 className="font-bold text-sm">{t("ticket.bookTickets")}</h3>
        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-2 py-1 rounded-lg">
          {t("ticket.earlyBirdEnds", { countdown: "02d : 14h : 36m : 48s" })}
        </span>
      </div>

      {/* Tiers */}
      <div className="divide-y divide-border/40">
        {TIERS.map((tier, i) => (
          <div key={tier.tierKey} className="p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{t(`ticket.tiers.${tier.tierKey}`)}</span>
                  {tier.badgeKey && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                      {t(`ticket.tiers.${tier.badgeKey}`)}
                    </span>
                  )}
                </div>
                <ul className="mt-1 space-y-0.5">
                  {tier.perks.map((p) => (
                    <li key={p} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Check className="h-3 w-3 text-green-500 shrink-0" />
                      {t(`ticket.perks.${p}`)}
                    </li>
                  ))}
                </ul>
                {i === 0 && (
                  <p className="text-[10px] text-red-500 font-medium mt-1">
                    {t("ticket.ticketsLeft", { count: 120 })}
                  </p>
                )}
              </div>

              <div className="shrink-0 text-right">
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
        <Button className="w-full py-5 font-bold shadow-lg shadow-primary/20">
          {t("ticket.bookNow")}
        </Button>
        <p className="flex items-center justify-center gap-1.5 mt-2 text-[11px] text-muted-foreground">
          <Shield className="h-3 w-3" />
          {t("ticket.secureCheckout")}
        </p>
      </div>
    </div>
  )
}
