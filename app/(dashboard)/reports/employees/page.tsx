"use client"

import { useState, useEffect } from "react"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface EmployeeReport {
  department: string
  position: string
  status: string
  count: number
}

export default function EmployeesReportPage() {
  const [user, setUser] = useState<any>(null)
  const [data, setData] = useState<EmployeeReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    auth().then((session) => {
      if (!session?.user) {
        window.location.href = "/login"
        return
      }
      setUser(session.user)
      fetchReport()
    })
  }, [])

  const fetchReport = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/reports/employees")
      const data = await response.json()
      setData(data)
    } catch (error) {
      console.error("Failed to fetch report:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    const headers = ["Department", "Position", "Status", "Count"]
    const rows = data.map((d) => [d.department, d.position, d.status, d.count])
    const csvContent = [headers, ...rows].map((r) => r.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "employees-report.csv"
    a.click()
  }

  if (!user) return null

  return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Employees Report</h1>
            <p className="text-muted-foreground">Headcount by department, position, and status</p>
          </div>
          <Button className="gap-2" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <Card accent="teal">
          <CardHeader>
            <CardTitle>Headcount Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : data.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">No data available</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Department</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Position</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3">{row.department || "—"}</td>
                        <td className="px-4 py-3">{row.position || "—"}</td>
                        <td className="px-4 py-3">{row.status}</td>
                        <td className="px-4 py-3 font-mono text-sm">{row.count}</td>
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
