"use client"

import { useState, useEffect } from "react"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Plus, Pencil, Trash2, DollarSign } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface PayrollRecord {
  id: string
  employeeName: string
  employeeId: string
  month: number
  year: number
  baseSalary: string
  grossSalary: string
  netSalary: string
  status: string
}

export default function PayrollPage() {
  const [user, setUser] = useState<any>(null)
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingPayroll, setEditingPayroll] = useState<PayrollRecord | null>(null)
  const [formData, setFormData] = useState({ employeeId: "", month: new Date().getMonth() + 1, year: new Date().getFullYear(), baseSalary: "", grossSalary: "", netSalary: "", status: "DRAFT" })
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([])
  const router = useRouter()

  useEffect(() => {
    auth().then((session) => {
      if (!session?.user) {
        window.location.href = "/login"
        return
      }
      setUser(session.user)
      fetchPayrolls()
      fetchEmployees()
    })
  }, [])

  const fetchPayrolls = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/payroll")
      const data = await response.json()
      setPayrolls(data)
    } catch (error) {
      console.error("Failed to fetch payrolls:", error)
      toast.error("Failed to load payroll records")
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees")
      const data = await response.json()
      setEmployees(data.map((e: any) => ({ id: e.id, name: `${e.firstName} ${e.lastName}` })))
    } catch (error) {
      console.error("Failed to fetch employees:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editingPayroll ? `/api/payroll/${editingPayroll.id}` : "/api/payroll"
    const method = editingPayroll ? "PUT" : "POST"

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(editingPayroll ? "Payroll record updated" : "Payroll record created")
        setSheetOpen(false)
        setEditingPayroll(null)
        setFormData({ employeeId: "", month: new Date().getMonth() + 1, year: new Date().getFullYear(), baseSalary: "", grossSalary: "", netSalary: "", status: "DRAFT" })
        fetchPayrolls()
      } else {
        toast.error("Failed to save payroll record")
      }
    } catch (error) {
      console.error("Failed to save payroll record:", error)
      toast.error("Failed to save payroll record")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payroll record?")) return

    try {
      const response = await fetch(`/api/payroll/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast.success("Payroll record deleted")
        fetchPayrolls()
      } else {
        toast.error("Failed to delete payroll record")
      }
    } catch (error) {
      console.error("Failed to delete payroll record:", error)
      toast.error("Failed to delete payroll record")
    }
  }

  const openEditSheet = (payroll: PayrollRecord) => {
    setEditingPayroll(payroll)
    setFormData({
      employeeId: payroll.employeeId,
      month: payroll.month,
      year: payroll.year,
      baseSalary: payroll.baseSalary,
      grossSalary: payroll.grossSalary,
      netSalary: payroll.netSalary,
      status: payroll.status,
    })
    setSheetOpen(true)
  }

  const openNewSheet = () => {
    setEditingPayroll(null)
    setFormData({ employeeId: "", month: new Date().getMonth() + 1, year: new Date().getFullYear(), baseSalary: "", grossSalary: "", netSalary: "", status: "DRAFT" })
    setSheetOpen(true)
  }

  const statusColors = {
    DRAFT: "bg-slate text-slate-foreground",
    PROCESSED: "bg-chart-2 text-chart-2-foreground",
    PAID: "bg-chart-5 text-chart-5-foreground",
  }

  if (!user) return null

  return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Payroll Records</h1>
            <p className="text-muted-foreground">Manage employee payroll</p>
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              render={<Button className="gap-2"><Plus className="h-4 w-4" />Add Payroll</Button>}
              onClick={openNewSheet}
            />
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{editingPayroll ? "Edit Payroll" : "Add Payroll"}</SheetTitle>
              </SheetHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Employee</label>
                  <select
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
                    required
                  >
                    <option value="">Select employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Month</label>
                    <Input
                      type="number"
                      min="1"
                      max="12"
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Year</label>
                    <Input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Base Salary</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.baseSalary}
                    onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gross Salary</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.grossSalary}
                    onChange={(e) => setFormData({ ...formData, grossSalary: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Net Salary</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.netSalary}
                    onChange={(e) => setFormData({ ...formData, netSalary: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PROCESSED">Processed</option>
                    <option value="PAID">Paid</option>
                  </select>
                </div>
                <Button type="submit" className="w-full">
                  {editingPayroll ? "Update" : "Create"} Payroll
                </Button>
              </form>
            </SheetContent>
          </Sheet>
        </div>

        <Card accent="green">
          <CardHeader>
            <CardTitle>All Payroll Records</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : payrolls.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">No payroll records found</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Employee</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Period</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Base Salary</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Gross Salary</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Net Salary</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrolls.map((payroll) => (
                      <tr key={payroll.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">{payroll.employeeName}</td>
                        <td className="px-4 py-3">
                          {new Date(payroll.year, payroll.month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {parseFloat(payroll.baseSalary).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {parseFloat(payroll.grossSalary).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {parseFloat(payroll.netSalary).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={statusColors[payroll.status as keyof typeof statusColors] || ""}>
                            {payroll.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openEditSheet(payroll)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive"
                              onClick={() => handleDelete(payroll.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
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
