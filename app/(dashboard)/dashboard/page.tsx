import { StatsGrid } from "../_components/StatsGrid"
import { AttendanceSparkline } from "../_components/AttendanceSparkline"
import { DepartmentDonut } from "../_components/DepartmentDonut"
import { ActivityFeed } from "../_components/ActivityFeed"
import { QuickActions } from "../_components/QuickActions"

export default function DashboardPage() {
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  return (
    <div className="space-y-6 p-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">{greeting}</h1>
        <p className="text-muted-foreground">
          {now.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Stats */}
      <StatsGrid />

      {/* Charts + Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <AttendanceSparkline />
            <DepartmentDonut />
          </div>
        </div>
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>
    </div>
  )
}