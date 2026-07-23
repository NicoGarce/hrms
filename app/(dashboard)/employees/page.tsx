import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AlertTriangle, Plus } from "lucide-react"
import { Breadcrumbs } from "../_components/Breadcrumbs"
import { EmployeesTable } from "./_components/EmployeesTable"

const ALLOWED_ROLES = ["SUPER_ADMINISTRATOR", "HR_ADMINISTRATOR", "DEPARTMENT_HEAD"]

export default async function EmployeesPage() {
  const session = await auth()

  if (!session?.user?.role || !ALLOWED_ROLES.includes(session.user.role as string)) {
    redirect("/dashboard")
  }

  try {
    const employees = await prisma.employee.findMany({
      where: { deletedAt: null },
      include: {
        department: { select: { name: true } },
        position: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    const rows = employees.map((emp) => ({
      id: emp.id,
      employeeCode: emp.employeeCode,
      firstName: emp.firstName,
      lastName: emp.lastName,
      department: emp.department?.name ?? null,
      position: emp.position?.title ?? null,
      status: emp.status,
      hireDate: emp.hireDate,
    }))

    return (
      <div className="space-y-6 p-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Breadcrumbs items={[{ label: "Employees" }]} />
            <h1 className="font-heading text-3xl font-bold tracking-tight mt-2">Employees</h1>
          </div>
          <Link
            href="/employees/new"
            className={cn(buttonVariants({ variant: "default" }))}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Link>
        </div>
        <EmployeesTable employees={rows} />
      </div>
    )
  } catch {
    return (
      <div className="space-y-6 p-8 animate-fade-in">
        <div className="space-y-1">
          <Breadcrumbs items={[{ label: "Employees" }]} />
          <h1 className="font-heading text-3xl font-bold tracking-tight mt-2">Employees</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="font-heading text-lg font-medium">Failed to load employees</h3>
            <p className="text-muted-foreground text-sm mt-1">
              An unexpected error occurred. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
}
