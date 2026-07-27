"use client"

import { useState, useEffect } from "react"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, DollarSign } from "lucide-react"

interface PayrollHistory {
  id: string
  employeeName: string
  month: number
  year: number
  grossSalary: string
  netSalary: string
  status: string
}

export default function PayrollHistoryPage() {
  const [user, setUser] = useState<any>(null)
  const [history, setHistory] = useState<PayrollHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [periodFilter, setPeriodFilter] = useState("")
  const [employeeFilter, setEmployeeFilter] = useState("")

  useEffect(() => {
    auth().then((session) => {
      if (!session?.user) {
        window.location.href = "/login"
        return
      }
      setUser(session.user)
      fetchHistory()
    })
  }, [])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/payroll")
      const data = await response.json()
      setHistory(data)
    } catch (error) {
      console.error("Failed to fetch history:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredHistory = history.filter((h) => {
    const periodStr = `${h.year}-${String(h.month).padStart(2, "0")}`
    const matchesPeriod = !periodFilter || periodStr.includes(periodFilter)
    const matchesEmployee = !employeeFilter || h.employeeName.toLowerCase().includes(employeeFilter.toLowerCase())
    return matchesPeriod && matchesEmployee
  })

  if (!user) return null

  return (
      <div className="space-y-6 p-8">
        <div>
          <h1 className="font-heading text-2xl font-bold">Payroll History</h1>
          <p className="text-muted-foreground">View past payroll runs</p>
        </div>

        <Card accent="green">
          <CardHeader>
            <CardTitle>Payroll Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Input
                placeholder="Filter by period (YYYY-MM)..."
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="max-w-xs"
              />
              <Input
                placeholder="Filter by employee..."
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                className="max-w-xs"
              />
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">No payroll history found</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Employee</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Period</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Gross Pay</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Net Pay</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">{record.employeeName}</td>
                        <td className="px-4 py-3">
                          {new Date(record.year, record.month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {parseFloat(record.grossSalary).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {parseFloat(record.netSalary).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3">{record.status}</td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/payroll/payslips`, "_blank")}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View Payslip
                          </Button>
                        </td>
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
