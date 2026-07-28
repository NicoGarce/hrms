"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PayslipView } from "../payroll/_components/PayslipView"
import { FileText, DollarSign, Printer } from "lucide-react"

interface MyPayslip {
  id: string
  month: number
  year: number
  baseSalary: string
  grossSalary: string
  netSalary: string
  status: string
  items: Array<{ type: string; name: string; amount: string }>
}

export default function MyPayslipsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const user = session?.user
  const [payslips, setPayslips] = useState<MyPayslip[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPayslip, setSelectedPayslip] = useState<MyPayslip | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (user) { fetchMyPayslips() }
  }, [status, user])

  const fetchMyPayslips = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/payslips")
      if (!response.ok) { setPayslips([]); return }
      const data = await response.json()
      setPayslips(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch payslips:", error)
      setPayslips([])
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (!user) return null

  return (
    <>
      <div className="space-y-6 p-8">
        <div>
          <h1 className="font-heading text-2xl font-bold">My Payslips</h1>
          <p className="text-muted-foreground">View your payroll history</p>
        </div>

        <Card accent="green">
          <CardHeader>
            <CardTitle>Payslip History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : payslips.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">No payslips yet</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Period</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Gross Pay</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Net Pay</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payslips.map((payslip) => (
                      <tr key={payslip.id} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedPayslip(payslip)}>
                        <td className="px-4 py-3 font-medium">
                          {new Date(payslip.year, payslip.month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {parseFloat(payslip.grossSalary).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm font-medium">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {parseFloat(payslip.netSalary).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3">{payslip.status}</td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPayslip(payslip)}
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

      <Dialog open={!!selectedPayslip} onOpenChange={() => setSelectedPayslip(null)}>
        <DialogContent className="max-w-md print:max-w-none">
          <DialogHeader>
            <DialogTitle>My Payslip</DialogTitle>
          </DialogHeader>
          {selectedPayslip && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-muted-foreground text-sm">
                  {new Date(selectedPayslip.year, selectedPayslip.month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 print:hidden"
                  onClick={handlePrint}
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
              </div>
              <PayslipView
                employeeName={user?.email || "Employee"}
                period={new Date(selectedPayslip.year, selectedPayslip.month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                baseSalary={selectedPayslip.baseSalary}
                grossSalary={selectedPayslip.grossSalary}
                netSalary={selectedPayslip.netSalary}
                items={selectedPayslip.items}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
