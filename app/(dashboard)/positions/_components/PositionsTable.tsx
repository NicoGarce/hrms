"use client"

import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Position {
  id: string
  title: string
  departmentId: string
  level: string
  description: string | null
  department: {
    id: string
    name: string
    code: string
  }
  _count: {
    employees: number
  }
}

interface Department {
  id: string
  name: string
  code: string
}

interface PositionsTableProps {
  positions: Position[]
  departments: Department[]
}

export function PositionsTable({ positions, departments }: PositionsTableProps) {
  const levelColors = {
    JUNIOR: "bg-chart-1 text-chart-1-foreground",
    MID: "bg-chart-2 text-chart-2-foreground",
    SENIOR: "bg-chart-3 text-chart-3-foreground",
    LEAD: "bg-chart-4 text-chart-4-foreground",
    EXECUTIVE: "bg-chart-5 text-chart-5-foreground",
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this position?")) return

    try {
      const response = await fetch(`/api/positions/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast.success("Position deleted")
        window.location.reload()
      } else {
        toast.error("Failed to delete position")
      }
    } catch (error) {
      console.error("Failed to delete position:", error)
      toast.error("Failed to delete position")
    }
  }

  if (positions.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">No positions found</div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Title</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Department</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Level</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Employees</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((position) => (
            <tr key={position.id} className="border-b hover:bg-muted/50">
              <td className="px-4 py-3 font-medium">{position.title}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-chart-2 text-chart-2-foreground text-xs font-medium">
                  {position.department.name}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${levelColors[position.level as keyof typeof levelColors]}`}>
                  {position.level}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-sm">{position._count.employees}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => window.location.href = `/positions/edit/${position.id}`}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive"
                    onClick={() => handleDelete(position.id)}
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
