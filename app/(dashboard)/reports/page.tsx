"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, CalendarClock, Plane, DollarSign, TrendingUp } from "lucide-react"

export default function ReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
  }, [status, router])

  if (status === "loading") return null

  const reports = [
    {
      title: "Employees Report",
      description: "Headcount by department, position, and status",
      href: "/reports/employees",
      icon: Users,
      accent: "teal",
    },
    {
      title: "Attendance Report",
      description: "Attendance rate over date range",
      href: "/reports/attendance",
      icon: CalendarClock,
      accent: "brass",
    },
    {
      title: "Leave Report",
      description: "Leave usage by type and department",
      href: "/reports/leave",
      icon: Plane,
      accent: "green",
    },
    {
      title: "Payroll Report",
      description: "Total payroll cost by department and period",
      href: "/reports/payroll",
      icon: DollarSign,
      accent: "brick",
      restricted: true,
    },
    {
      title: "Analytics",
      description: "Trend charts for headcount, attendance, and leave",
      href: "/reports/analytics",
      icon: TrendingUp,
      accent: "slate",
    },
  ]

  return (
      <div className="space-y-6 p-8">
        <div>
          <h1 className="font-heading text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground">View HR analytics and reports</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => {
            if (report.restricted && session?.user?.role !== "SUPER_ADMINISTRATOR" && session?.user?.role !== "HR_ADMINISTRATOR") {
              return null
            }
            const Icon = report.icon
            return (
              <Card key={report.href} accent={report.accent as any}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {report.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">{report.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.location.href = report.href}
                  >
                    View Report
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
  )
}
