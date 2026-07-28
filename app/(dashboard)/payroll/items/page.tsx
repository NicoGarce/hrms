"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Plus, Pencil, Trash2, DollarSign } from "lucide-react"
import { toast } from "sonner"

interface PayrollItem {
  id: string
  payrollId: string
  payrollPeriod: string
  employeeName: string
  type: string
  name: string
  amount: string
}

export default function PayrollItemsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const user = session?.user
  const [items, setItems] = useState<PayrollItem[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PayrollItem | null>(null)
  const [formData, setFormData] = useState({ payrollId: "", type: "ALLOWANCE", name: "", amount: "" })
  const [payrolls, setPayrolls] = useState<{ id: string; period: string; employeeName: string }[]>([])

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (session?.user) { fetchItems(); fetchPayrolls() }
  }, [status, session])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/payroll/items")
      const data = await response.json()
      setItems(data)
    } catch (error) {
      console.error("Failed to fetch items:", error)
      toast.error("Failed to load payroll items")
    } finally {
      setLoading(false)
    }
  }

  const fetchPayrolls = async () => {
    try {
      const response = await fetch("/api/payroll")
      const data = await response.json()
      setPayrolls(data.map((p: any) => ({
        id: p.id,
        period: `${p.year}-${String(p.month).padStart(2, "0")}`,
        employeeName: p.employeeName,
      })))
    } catch (error) {
      console.error("Failed to fetch payrolls:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editingItem ? `/api/payroll/items/${editingItem.id}` : "/api/payroll/items"
    const method = editingItem ? "PUT" : "POST"

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(editingItem ? "Item updated" : "Item created")
        setSheetOpen(false)
        setEditingItem(null)
        setFormData({ payrollId: "", type: "ALLOWANCE", name: "", amount: "" })
        fetchItems()
      } else {
        toast.error("Failed to save item")
      }
    } catch (error) {
      console.error("Failed to save item:", error)
      toast.error("Failed to save item")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return

    try {
      const response = await fetch(`/api/payroll/items/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast.success("Item deleted")
        fetchItems()
      } else {
        toast.error("Failed to delete item")
      }
    } catch (error) {
      console.error("Failed to delete item:", error)
      toast.error("Failed to delete item")
    }
  }

  const openEditSheet = (item: PayrollItem) => {
    setEditingItem(item)
    setFormData({
      payrollId: item.payrollId,
      type: item.type,
      name: item.name,
      amount: item.amount,
    })
    setSheetOpen(true)
  }

  const openNewSheet = () => {
    setEditingItem(null)
    setFormData({ payrollId: "", type: "ALLOWANCE", name: "", amount: "" })
    setSheetOpen(true)
  }

  const typeColors = {
    ALLOWANCE: "bg-chart-3 text-chart-3-foreground",
    DEDUCTION: "bg-chart-4 text-chart-4-foreground",
    BONUS: "bg-chart-2 text-chart-2-foreground",
  }

  if (status === "loading") return null

  return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Payroll Items</h1>
            <p className="text-muted-foreground">Manage allowances, deductions, and bonuses</p>
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              render={<Button className="gap-2"><Plus className="h-4 w-4" />Add Item</Button>}
              onClick={openNewSheet}
            />
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{editingItem ? "Edit Item" : "Add Item"}</SheetTitle>
              </SheetHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payroll Period</label>
                  <select
                    value={formData.payrollId}
                    onChange={(e) => setFormData({ ...formData, payrollId: e.target.value })}
                    className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
                    required
                  >
                    <option value="">Select payroll period</option>
                    {payrolls.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.employeeName} - {p.period}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
                  >
                    <option value="ALLOWANCE">Allowance</option>
                    <option value="DEDUCTION">Deduction</option>
                    <option value="BONUS">Bonus</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingItem ? "Update" : "Create"} Item
                </Button>
              </form>
            </SheetContent>
          </Sheet>
        </div>

        <Card accent="green">
          <CardHeader>
            <CardTitle>All Payroll Items</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : items.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">No items found</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Employee</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Period</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">{item.employeeName}</td>
                        <td className="px-4 py-3">{item.payrollPeriod}</td>
                        <td className="px-4 py-3">
                          <Badge className={typeColors[item.type as keyof typeof typeColors] || ""}>
                            {item.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">{item.name}</td>
                        <td className="px-4 py-3 font-mono text-sm">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {parseFloat(item.amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openEditSheet(item)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive"
                              onClick={() => handleDelete(item.id)}
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
