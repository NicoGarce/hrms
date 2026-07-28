"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, CalendarCheck, Plane } from "lucide-react"

interface TrendData {
  period: string
  value: number
}

export default function AnalyticsReportPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [headcountTrend, setHeadcountTrend] = useState<TrendData[]>([])
  const [attendanceTrend, setAttendanceTrend] = useState<TrendData[]>([])
  const [leaveTrend, setLeaveTrend] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (session?.user) { fetchAnalytics() }
  }, [status, session, router])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const [hcRes, attRes, leaveRes] = await Promise.all([
        fetch("/api/reports/analytics/headcount"),
        fetch("/api/reports/analytics/attendance"),
        fetch("/api/reports/analytics/leave"),
      ])
      setHeadcountTrend(await hcRes.json())
      setAttendanceTrend(await attRes.json())
      setLeaveTrend(await leaveRes.json())
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderTrendChart = (data: TrendData[], color: string) => {
    const maxValue = Math.max(...data.map((d) => d.value), 1)
    return (
      <div className="space-y-2">
        {data.map((d, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-16">{d.period}</span>
            <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
              <div
                className={`h-full ${color} transition-all`}
                style={{ width: `${(d.value / maxValue) * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono w-12 text-right">{d.value}</span>
          </div>
        ))}
      </div>
    )
  }

  if (status === "loading") return null

  return (
      <div className="space-y-6 p-8">
        <div>
          <h1 className="font-heading text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Trend charts for HR metrics</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card accent="teal">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Headcount Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-muted-foreground text-sm">Loading...</div>
              ) : headcountTrend.length === 0 ? (
                <div className="text-muted-foreground text-sm">No data</div>
              ) : (
                renderTrendChart(headcountTrend, "bg-chart-3")
              )}
            </CardContent>
          </Card>

          <Card accent="brass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5" />
                Attendance Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-muted-foreground text-sm">Loading...</div>
              ) : attendanceTrend.length === 0 ? (
                <div className="text-muted-foreground text-sm">No data</div>
              ) : (
                renderTrendChart(attendanceTrend, "bg-chart-2")
              )}
            </CardContent>
          </Card>

          <Card accent="green">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Leave Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-muted-foreground text-sm">Loading...</div>
              ) : leaveTrend.length === 0 ? (
                <div className="text-muted-foreground text-sm">No data</div>
              ) : (
                renderTrendChart(leaveTrend, "bg-chart-4")
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  )
}
