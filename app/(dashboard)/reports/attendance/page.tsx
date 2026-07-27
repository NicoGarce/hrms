"use client"

import { useState, useEffect } from "react"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Calendar } from "lucide-react"

interface AttendanceReport {
  date: string
  present: number
  absent: number
  late: number
  halfDay: number
  total: number
  rate: number
}

export default function AttendanceReportPage() {
  const [user, setUser] = useState<any>(null)
  const [data, setData] = useState<AttendanceReport[]>([])
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
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
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
      const response = await fetch(`/api/reports/attendance?startDate=${startDate}&endDate=${endDate}`)
      const data = await response.json()
      setData(data)
    } catch (error) {
      console.error("Failed to fetch report:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    const headers = ["Date", "Present", "Absent", "Late", "Half Day", "Total", "Rate (%)"]
    const rows = data.map((d) => [d.date, d.present, d.absent, d.late, d.halfDay, d.total, d.rate.toFixed(1)])
    const csvContent = [headers, ...rows].map((r) => r.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "attendance-report.csv"
    a.click()
  }

  if (!user) return null

  return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Attendance Report</h1>
            <p className="text-muted-foreground">Attendance rate over date range</p>
          </div>
          <Button className="gap-2" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <Card accent="brass">
          <CardHeader>
            <CardTitle>Attendance Summary</CardTitle>
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
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Present</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Absent</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Late</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Half Day</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Total</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3">{row.date}</td>
                        <td className="px-4 py-3 font-mono text-sm text-chart-3">{row.present}</td>
                        <td className="px-4 py-3 font-mono text-sm text-chart-4">{row.absent}</td>
                        <td className="px-4 py-3 font-mono text-sm text-chart-2">{row.late}</td>
                        <td className="px-4 py-3 font-mono text-sm">{row.halfDay}</td>
                        <td className="px-4 py-3 font-mono text-sm">{row.total}</td>
                        <td className="px-4 py-3 font-mono text-sm font-medium">{row.rate.toFixed(1)}%</td>
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
