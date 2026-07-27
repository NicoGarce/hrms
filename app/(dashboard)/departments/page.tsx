import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2 } from "lucide-react"
import { DepartmentsTable } from "./_components/DepartmentsTable"
import { DepartmentSheet } from "./_components/DepartmentSheet"

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

const ALLOWED_ROLES = ["SUPER_ADMINISTRATOR", "HR_ADMINISTRATOR"]

export default async function DepartmentsPage() {
  const session = await auth()

  if (!session?.user?.role || !ALLOWED_ROLES.includes(session.user.role as string)) {
    redirect("/dashboard")
  }

  const departments = await prisma.department.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { employees: true, positions: true }
      }
    }
  })

  const employees = await prisma.employee.findMany({
    where: { deletedAt: null },
    select: { id: true, firstName: true, lastName: true },
    orderBy: { firstName: "asc" }
  })

  // Map head names to departments
  const departmentsWithHead = departments.map(dept => {
    const head = employees.find(emp => emp.id === dept.headId)
    return {
      ...dept,
      head: head ? { id: head.id, firstName: head.firstName, lastName: head.lastName } : null
    }
  })

  return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Departments</h1>
            <p className="text-muted-foreground">Manage company departments</p>
          </div>
          <DepartmentSheet employees={employees as any} />
        </div>

        <Card accent="brass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              All Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DepartmentsTable departments={departmentsWithHead} employees={employees as any} />
          </CardContent>
        </Card>
      </div>
  )
}
