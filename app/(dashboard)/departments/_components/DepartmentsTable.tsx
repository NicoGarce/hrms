"use client"

import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Department {
  id: string
  name: string
  code: string
  description: string | null
  headId: string | null
  head?: { id: string; firstName: string; lastName: string } | null
  _count?: {
    employees: number
    positions: number
  }
}

interface Employee {
  id: string
  firstName: string
  lastName: string
}

interface DepartmentsTableProps {
  departments: Department[]
  employees: Employee[]
}

export function DepartmentsTable({ departments, employees }: DepartmentsTableProps) {
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return

    try {
      const response = await fetch(`/api/departments/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast.success("Department deleted")
        window.location.reload()
      } else {
        toast.error("Failed to delete department")
      }
    } catch (error) {
      console.error("Failed to delete department:", error)
      toast.error("Failed to delete department")
    }
  }

  if (departments.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">No departments found</div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Code</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Description</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Head</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Employees</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Positions</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((department) => (
            <tr key={department.id} className="border-b hover:bg-muted/50">
              <td className="px-4 py-3 font-medium">{department.name}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-chart-2 text-chart-2-foreground text-xs font-medium">
                  {department.code}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                {department.description || "—"}
              </td>
              <td className="px-4 py-3 text-sm">
                {department.head ? `${department.head.firstName} ${department.head.lastName}` : "—"}
              </td>
              <td className="px-4 py-3 font-mono text-sm">{department._count?.employees || 0}</td>
              <td className="px-4 py-3 font-mono text-sm">{department._count?.positions || 0}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => window.location.href = `/departments/edit/${department.id}`}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive"
                    onClick={() => handleDelete(department.id)}
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
  )
}
