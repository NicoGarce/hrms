"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Plus } from "lucide-react"
import { toast } from "sonner"

interface Employee {
  id: string
  firstName: string
  lastName: string
}

interface Department {
  id: string
  name: string
  code: string
  description: string | null
  headId: string | null
}

interface DepartmentSheetProps {
  employees: Employee[]
  department?: Department | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DepartmentSheet({ employees, department, open: controlledOpen, onOpenChange }: DepartmentSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  const [formData, setFormData] = useState({
    name: department?.name || "",
    code: department?.code || "",
    description: department?.description || "",
    headId: department?.headId || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = department ? `/api/departments/${department.id}` : "/api/departments"
      const method = department ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(department ? "Department updated" : "Department created")
        setOpen(false)
        window.location.reload()
      } else {
        toast.error("Failed to save department")
      }
    } catch (error) {
      console.error("Failed to save department:", error)
      toast.error("Failed to save department")
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {!department && (
        <SheetTrigger render={<Button className="gap-2"><Plus className="h-4 w-4" />Add Department</Button>} />
      )}
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{department ? "Edit Department" : "Add Department"}</SheetTitle>
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
            <label className="text-sm font-medium">Code</label>
            <Input
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              required
              placeholder="e.g., ENG, HR, FIN"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full min-h-20 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
              placeholder="Department description"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Department Head</label>
            <select
              value={formData.headId}
              onChange={(e) => setFormData({ ...formData, headId: e.target.value })}
              className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
            >
              <option value="">Select department head</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" className="w-full">
            {department ? "Update" : "Create"} Department
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
