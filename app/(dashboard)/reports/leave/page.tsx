"use client"

import { useState, useEffect } from "react"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Plane } from "lucide-react"

interface LeaveReport {
  leaveType: string
  department: string
  count: number
  days: number
}

export default function LeaveReportPage() {
  const [user, setUser] = useState<any>(null)
  const [data, setData] = useState<LeaveReport[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    auth().then((session) => {
      if (!session?.user) {
        window.location.href = "/login"
        return
      }
      setUser(session.user)
      const today = new Date()
      const firstDay = new Date(today.getFullYear(), 0, 1)
      setStartDate(firstDay.toISOString().split("T")[0])
      setEndDate(today.toISOString().split("T")[0])
    })
  }, [])

  useEffect(() => {
    if (startDate && endDate) fetchReport()
  }, [startDate, endDate])

  const fetchReport = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reports/leave?startDate=${startDate}&endDate=${endDate}`)
      const data = await response.json()
      setData(data)
    } catch (error) {
      console.error("Failed to fetch report:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    const headers = ["Leave Type", "Department", "Count", "Days"]
    const rows = data.map((d) => [d.leaveType, d.department, d.count, d.days])
    const csvContent = [headers, ...rows].map((r) => r.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "leave-report.csv"
    a.click()
  }

  if (!user) return null

  return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Leave Report</h1>
            <p className="text-muted-foreground">Leave usage by type and department</p>
          </div>
          <Button className="gap-2" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <Card accent="green">
          <CardHeader>
            <CardTitle>Leave Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-40"
                />
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : data.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">No data available for selected period</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Leave Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Department</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Count</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3">{row.leaveType}</td>
                        <td className="px-4 py-3">{row.department || "—"}</td>
                        <td className="px-4 py-3 font-mono text-sm">{row.count}</td>
                        <td className="px-4 py-3 font-mono text-sm">{row.days}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  )
}
