"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PayslipView } from "../_components/PayslipView"
import { FileText } from "lucide-react"

interface PayrollRecord {
  id: string
  employeeName: string
  employeeCode?: string
  department?: string
  month: number
  year: number
  baseSalary: string
  grossSalary: string
  netSalary: string
  status: string
  items: Array<{ type: string; name: string; amount: string }>
}

export default function AdminPayslipsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const user = session?.user
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRecord | null>(null)
  const [employeeFilter, setEmployeeFilter] = useState("")
  const [periodFilter, setPeriodFilter] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (session?.user) { fetchPayrolls() }
  }, [status, session])

  const fetchPayrolls = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/payroll")
      const data = await response.json()
      setPayrolls(data)
    } catch (error) {
      console.error("Failed to fetch payrolls:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPayrolls = payrolls.filter((p) => {
    const matchesEmployee = !employeeFilter || p.employeeName.toLowerCase().includes(employeeFilter.toLowerCase())
    const periodStr = `${p.year}-${String(p.month).padStart(2, "0")}`
    const matchesPeriod = !periodFilter || periodStr.includes(periodFilter)
    return matchesEmployee && matchesPeriod
  })

  if (status === "loading") return null

  return (
    <>
      <div className="space-y-6 p-8">
        <div>
          <h1 className="font-heading text-2xl font-bold">Admin Payslips</h1>
          <p className="text-muted-foreground">View and manage employee payslips</p>
        </div>

        <Card accent="green">
          <CardHeader>
            <CardTitle>Payslip History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Input
                placeholder="Filter by employee name..."
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                className="max-w-xs"
              />
              <Input
                placeholder="Filter by period (YYYY-MM)..."
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="max-w-xs"
              />
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : filteredPayrolls.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">No payslips found</div>
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
                    {filteredPayrolls.map((payroll) => (
                      <tr key={payroll.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">{payroll.employeeName}</td>
                        <td className="px-4 py-3">
                          {new Date(payroll.year, payroll.month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm">
                          ${parseFloat(payroll.grossSalary).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm font-medium">
                          ${parseFloat(payroll.netSalary).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">{payroll.status}</td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPayroll(payroll)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View
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

      <Dialog open={!!selectedPayroll} onOpenChange={() => setSelectedPayroll(null)}>
        <DialogContent className="max-w-md print:max-w-none">
          <DialogHeader>
            <DialogTitle>Payslip Details</DialogTitle>
          </DialogHeader>
          {selectedPayroll && (
            <PayslipView
              employeeName={selectedPayroll.employeeName}
              employeeCode={selectedPayroll.employeeCode}
              department={selectedPayroll.department}
              period={new Date(selectedPayroll.year, selectedPayroll.month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              baseSalary={selectedPayroll.baseSalary}
              grossSalary={selectedPayroll.grossSalary}
              netSalary={selectedPayroll.netSalary}
              items={selectedPayroll.items}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
