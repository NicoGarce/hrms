import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EmployeeForm } from "../../_components/EmployeeForm"

const ALLOWED_ROLES = ["SUPER_ADMINISTRATOR", "HR_ADMINISTRATOR", "DEPARTMENT_HEAD"]

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()

  if (!session?.user?.role || !ALLOWED_ROLES.includes(session.user.role as string)) {
    redirect("/dashboard")
  }

  const { id } = await params

  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      user: { select: { email: true } },
      profile: { select: { phone: true } },
    },
  })

  if (!employee || employee.deletedAt) {
    notFound()
  }

  const [departments, positions] = await Promise.all([
    prisma.department.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.position.findMany({
      where: { deletedAt: null },
      select: { id: true, title: true, departmentId: true },
      orderBy: { title: "asc" },
    }),
  ])

  const hireDate =
    employee.hireDate instanceof Date
      ? employee.hireDate.toISOString().split("T")[0]
      : String(employee.hireDate).split("T")[0]

  return (
    <EmployeeForm
      mode="edit"
      employeeId={employee.id}
      departments={departments.map((d) => ({ id: d.id, name: d.name }))}
      positions={positions.map((p) => ({
        id: p.id,
        name: p.title,
        departmentId: p.departmentId,
      }))}
      defaultValues={{
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.user.email,
        phone: employee.profile?.phone ?? "",
        departmentId: employee.departmentId ?? "",
        positionId: employee.positionId ?? "",
        hireDate,
        status: employee.status,
      }}
    />
  )
}
