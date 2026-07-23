'use client'

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plane, UserPlus, BarChart3 } from "lucide-react"

export function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      label: "Request Leave",
      icon: Plane,
      href: "/leave/request",
    },
    {
      label: "Add Employee",
      icon: UserPlus,
      href: "/employees/new",
    },
    {
      label: "Generate Report",
      icon: BarChart3,
      href: "/reports",
    },
  ]

  return (
    <div className="flex gap-3">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Button
            key={action.label}
            variant="outline"
            className="rounded-full gap-2"
            onClick={() => router.push(action.href)}
          >
            <Icon className="h-4 w-4" />
            {action.label}
          </Button>
        )
      })}
    </div>
  )
}
