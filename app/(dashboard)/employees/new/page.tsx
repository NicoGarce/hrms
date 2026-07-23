import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EmployeeForm } from "../_components/EmployeeForm"

const ALLOWED_ROLES = ["SUPER_ADMINISTRATOR", "HR_ADMINISTRATOR", "DEPARTMENT_HEAD"]

export default async function NewEmployeePage() {
  const session = await auth()

  if (!session?.user?.role || !ALLOWED_ROLES.includes(session.user.role as string)) {
    redirect("/dashboard")
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

  return (
    <EmployeeForm
      mode="create"
      departments={departments.map((d) => ({ id: d.id, name: d.name }))}
      positions={positions.map((p) => ({
        id: p.id,
        name: p.title,
        departmentId: p.departmentId,
      }))}
    />
  )
}
