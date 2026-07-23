import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Users, UserCheck, Plane, Clock } from "lucide-react"

export async function StatsGrid() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [totalEmployees, presentToday, onLeave, pendingRequests] = await Promise.all([
    prisma.employee.count({ where: { deletedAt: null } }),
    prisma.attendance.count({
      where: {
        date: { gte: today, lt: tomorrow },
        status: "PRESENT",
      },
    }),
    prisma.leaveRequest.count({
      where: {
        status: "APPROVED",
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    }),
    prisma.leaveRequest.count({
      where: { status: "PENDING" },
    }),
  ])

  const stats = [
    {
      title: "Total Employees",
      value: totalEmployees,
      icon: Users,
      trend: "+2.5%",
      trendUp: true,
      accent: "teal" as const,
    },
    {
      title: "Present Today",
      value: presentToday,
      icon: UserCheck,
      trend: "+5.2%",
      trendUp: true,
      accent: "green" as const,
    },
    {
      title: "On Leave",
      value: onLeave,
      icon: Plane,
      trend: "-1.2%",
      trendUp: false,
      accent: "brass" as const,
    },
    {
      title: "Pending Requests",
      value: pendingRequests,
      icon: Clock,
      trend: "+3",
      trendUp: true,
      accent: "brick" as const,
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card
            key={stat.title}
            accent={stat.accent}
            className="hover:shadow-md transition-all duration-200"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="font-mono text-3xl font-semibold">{stat.value}</p>
                </div>
                <div
                  className="rounded-lg p-3"
                  style={{ backgroundColor: "color-mix(in oklch, var(--tab-color), transparent 85%)" }}
                >
                  <Icon className="h-5 w-5" style={{ color: "var(--tab-color)" }} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span
                  className="font-mono font-medium"
                  style={{
                    color: stat.trendUp ? "var(--chart-3)" : "var(--chart-4)",
                  }}
                >
                  {stat.trend}
                </span>
                <span className="ml-2 text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}