"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, DollarSign } from "lucide-react"

interface PayrollReport {
  department: string
  month: number
  year: number
  totalCost: string
  employeeCount: number
}

export default function PayrollReportPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<PayrollReport[]>([])
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear().toString())

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (status === "authenticated" && session?.user) {
      if (session.user.role !== "SUPER_ADMINISTRATOR" && session.user.role !== "HR_ADMINISTRATOR") {
        router.push("/dashboard")
        return
      }
      fetchReport()
    }
  }, [status, session, router, year])

  const fetchReport = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reports/payroll?year=${year}`)
      const data = await response.json()
      setData(data)
    } catch (error) {
      console.error("Failed to fetch report:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    const headers = ["Department", "Month", "Year", "Total Cost", "Employee Count"]
    const rows = data.map((d) => [d.department, d.month, d.year, d.totalCost, d.employeeCount])
    const csvContent = [headers, ...rows].map((r) => r.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "payroll-report.csv"
    a.click()
  }

  if (status === "loading") return null

  if (session?.user?.role !== "SUPER_ADMINISTRATOR" && session?.user?.role !== "HR_ADMINISTRATOR") {
    return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Access restricted to SUPER_ADMINISTRATOR and HR_ADMINISTRATOR</div>
        </div>
      </div>
    )
  }

  return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Payroll Report</h1>
            <p className="text-muted-foreground">Total payroll cost by department and period</p>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-24"
              placeholder="Year"
            />
            <Button className="gap-2" onClick={handleExportCSV}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <Card accent="brick">
          <CardHeader>
            <CardTitle>Payroll Cost Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : data.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">No data available for selected year</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Department</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Month</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Year</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Total Cost</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Employee Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3">{row.department || "—"}</td>
                        <td className="px-4 py-3">{row.month}</td>
                        <td className="px-4 py-3">{row.year}</td>
                        <td className="px-4 py-3 font-mono text-sm font-medium">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {parseFloat(row.totalCost).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm">{row.employeeCount}</td>
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
