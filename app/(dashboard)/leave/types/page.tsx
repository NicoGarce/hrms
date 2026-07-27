"use client"

import { useState, useEffect } from "react"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface LeaveType {
  id: string
  name: string
  daysAllowed: number
  carryForward: boolean
}

export default function LeaveTypesPage() {
  const [user, setUser] = useState<any>(null)
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null)
  const [formData, setFormData] = useState({ name: "", daysAllowed: "", carryForward: false })

  useEffect(() => {
    auth().then((session) => {
      if (!session?.user) {
        window.location.href = "/login"
        return
      }
      setUser(session.user)
      fetchLeaveTypes()
    })
  }, [])

  const fetchLeaveTypes = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/leave/types")
      const data = await response.json()
      setLeaveTypes(data)
    } catch (error) {
      console.error("Failed to fetch leave types:", error)
      toast.error("Failed to load leave types")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editingLeaveType ? `/api/leave/types/${editingLeaveType.id}` : "/api/leave/types"
    const method = editingLeaveType ? "PUT" : "POST"

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          daysAllowed: parseInt(formData.daysAllowed),
        }),
      })

      if (response.ok) {
        toast.success(editingLeaveType ? "Leave type updated" : "Leave type created")
        setSheetOpen(false)
        setEditingLeaveType(null)
        setFormData({ name: "", daysAllowed: "", carryForward: false })
        fetchLeaveTypes()
      } else {
        toast.error("Failed to save leave type")
      }
    } catch (error) {
      console.error("Failed to save leave type:", error)
      toast.error("Failed to save leave type")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this leave type?")) return

    try {
      const response = await fetch(`/api/leave/types/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast.success("Leave type deleted")
        fetchLeaveTypes()
      } else {
        toast.error("Failed to delete leave type")
      }
    } catch (error) {
      console.error("Failed to delete leave type:", error)
      toast.error("Failed to delete leave type")
    }
  }

  const openEditSheet = (leaveType: LeaveType) => {
    setEditingLeaveType(leaveType)
    setFormData({
      name: leaveType.name,
      daysAllowed: leaveType.daysAllowed.toString(),
      carryForward: leaveType.carryForward,
    })
    setSheetOpen(true)
  }

  const openNewSheet = () => {
    setEditingLeaveType(null)
    setFormData({ name: "", daysAllowed: "", carryForward: false })
    setSheetOpen(true)
  }

  if (!user) return null

  return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Leave Types</h1>
            <p className="text-muted-foreground">Manage leave type configurations</p>
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              render={<Button className="gap-2"><Plus className="h-4 w-4" />Add Leave Type</Button>}
              onClick={openNewSheet}
            />
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{editingLeaveType ? "Edit Leave Type" : "Add Leave Type"}</SheetTitle>
              </SheetHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Days Allowed</label>
                  <Input
                    type="number"
                    value={formData.daysAllowed}
                    onChange={(e) => setFormData({ ...formData, daysAllowed: e.target.value })}
                    required
                    min="1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="carryForward"
                    checked={formData.carryForward}
                    onChange={(e) => setFormData({ ...formData, carryForward: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <label htmlFor="carryForward" className="text-sm font-medium">
                    Allow carry forward to next year
                  </label>
                </div>
                <Button type="submit" className="w-full">
                  {editingLeaveType ? "Update" : "Create"} Leave Type
                </Button>
              </form>
            </SheetContent>
          </Sheet>
        </div>

        <Card accent="teal">
          <CardHeader>
            <CardTitle>All Leave Types</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : leaveTypes.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">No leave types found</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Days Allowed</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Carry Forward</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveTypes.map((leaveType) => (
                      <tr key={leaveType.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">{leaveType.name}</td>
                        <td className="px-4 py-3 font-mono text-sm">{leaveType.daysAllowed} days</td>
                        <td className="px-4 py-3">
                          {leaveType.carryForward ? (
                            <span className="text-chart-3">Yes</span>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openEditSheet(leaveType)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive"
                              onClick={() => handleDelete(leaveType.id)}
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
