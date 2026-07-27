"use client"

import { useState, useEffect } from "react"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Plus, Pencil, Trash2, Calendar } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

interface Holiday {
  id: string
  name: string
  date: string
  type: string
}

export default function HolidaysPage() {
  const [user, setUser] = useState<any>(null)
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null)
  const [formData, setFormData] = useState({ name: "", date: "", type: "PUBLIC" })

  useEffect(() => {
    auth().then((session) => {
      if (!session?.user) {
        window.location.href = "/login"
        return
      }
      setUser(session.user)
      fetchHolidays()
    })
  }, [])

  const fetchHolidays = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/attendance/holidays")
      const data = await response.json()
      setHolidays(data)
    } catch (error) {
      console.error("Failed to fetch holidays:", error)
      toast.error("Failed to load holidays")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editingHoliday ? `/api/attendance/holidays/${editingHoliday.id}` : "/api/attendance/holidays"
    const method = editingHoliday ? "PUT" : "POST"

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(editingHoliday ? "Holiday updated" : "Holiday created")
        setSheetOpen(false)
        setEditingHoliday(null)
        setFormData({ name: "", date: "", type: "PUBLIC" })
        fetchHolidays()
      } else {
        toast.error("Failed to save holiday")
      }
    } catch (error) {
      console.error("Failed to save holiday:", error)
      toast.error("Failed to save holiday")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this holiday?")) return

    try {
      const response = await fetch(`/api/attendance/holidays/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast.success("Holiday deleted")
        fetchHolidays()
      } else {
        toast.error("Failed to delete holiday")
      }
    } catch (error) {
      console.error("Failed to delete holiday:", error)
      toast.error("Failed to delete holiday")
    }
  }

  const openEditSheet = (holiday: Holiday) => {
    setEditingHoliday(holiday)
    setFormData({
      name: holiday.name,
      date: holiday.date.split("T")[0],
      type: holiday.type,
    })
    setSheetOpen(true)
  }

  const openNewSheet = () => {
    setEditingHoliday(null)
    setFormData({ name: "", date: "", type: "PUBLIC" })
    setSheetOpen(true)
  }

  if (!user) return null

  return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Holidays</h1>
            <p className="text-muted-foreground">Manage company holidays</p>
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              render={<Button className="gap-2"><Plus className="h-4 w-4" />Add Holiday</Button>}
              onClick={openNewSheet}
            />
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{editingHoliday ? "Edit Holiday" : "Add Holiday"}</SheetTitle>
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
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
                  >
                    <option value="PUBLIC">Public Holiday</option>
                    <option value="COMPANY">Company Holiday</option>
                  </select>
                </div>
                <Button type="submit" className="w-full">
                  {editingHoliday ? "Update" : "Create"} Holiday
                </Button>
              </form>
            </SheetContent>
          </Sheet>
        </div>

        <Card accent="teal">
          <CardHeader>
            <CardTitle>All Holidays</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : holidays.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">No holidays found</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holidays.map((holiday) => (
                      <tr key={holiday.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">{holiday.name}</td>
                        <td className="px-4 py-3 font-mono text-sm">{format(new Date(holiday.date), "MMM d, yyyy")}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="gap-1">
                            <Calendar className="h-3 w-3" />
                            {holiday.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openEditSheet(holiday)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive"
                              onClick={() => handleDelete(holiday.id)}
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
