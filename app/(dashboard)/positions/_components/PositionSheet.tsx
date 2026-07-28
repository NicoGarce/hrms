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

interface Position {
  id: string
  title: string
  departmentId: string
  level: string
  description: string | null
}

interface PositionSheetProps {
  departments: Department[]
  position?: Position | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function PositionSheet({ departments, position, open: controlledOpen, onOpenChange }: PositionSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  const [formData, setFormData] = useState({
    title: position?.title || "",
    departmentId: position?.departmentId || "",
    level: position?.level || "MID",
    description: position?.description || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = position ? `/api/positions/${position.id}` : "/api/positions"
      const method = position ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(position ? "Position updated" : "Position created")
        setOpen(false)
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
      {!position && (
        <SheetTrigger render={<Button className="gap-2"><Plus className="h-4 w-4" />Add Position</Button>} />
      )}
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{position ? "Edit Position" : "Add Position"}</SheetTitle>
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
            {position ? "Update" : "Create"} Position
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
