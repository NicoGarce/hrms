"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Plus } from "lucide-react"
import { toast } from "sonner"

interface Department {
  id: string
  name: string
  code: string
}

interface PositionSheetProps {
  departments: Department[]
}

export function PositionSheet({ departments }: PositionSheetProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({ title: "", departmentId: "", level: "MID", description: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success("Position created")
        setOpen(false)
        setFormData({ title: "", departmentId: "", level: "MID", description: "" })
        window.location.reload()
      } else {
        toast.error("Failed to save position")
      }
    } catch (error) {
      console.error("Failed to save position:", error)
      toast.error("Failed to save position")
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button className="gap-2"><Plus className="h-4 w-4" />Add Position</Button>}
      />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Position</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Department</label>
            <select
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
              required
            >
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Level</label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
            >
              <option value="JUNIOR">Junior</option>
              <option value="MID">Mid-Level</option>
              <option value="SENIOR">Senior</option>
              <option value="LEAD">Lead</option>
              <option value="EXECUTIVE">Executive</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full min-h-20 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
              placeholder="Position description"
            />
          </div>
          <Button type="submit" className="w-full">
            Create Position
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
