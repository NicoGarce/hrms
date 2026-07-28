import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userEmail = session.user.email
    const role = (session.user as any).role

    let where: any = { deletedAt: null }

    if (role === "EMPLOYEE") {
      const employee = await prisma.employee.findFirst({
        where: { user: { email: userEmail } },
        select: { id: true },
      })
      if (!employee) {
        return NextResponse.json([])
      }
      where.id = employee.id
    } else if (role === "DEPARTMENT_HEAD") {
      const head = await prisma.employee.findFirst({
        where: { user: { email: userEmail } },
        select: { departmentId: true },
      })
      if (head?.departmentId) {
        where.departmentId = head.departmentId
      }
    }

    const employees = await prisma.employee.findMany({
      where,
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        status: true,
        departmentId: true,
        department: {
          select: { id: true, name: true, code: true },
        },
        position: {
          select: { id: true, title: true },
        },
        profile: {
          select: { phone: true, avatar: true },
        },
        user: {
          select: { email: true },
        },
      },
    })

    return NextResponse.json(employees)
  } catch (error) {
    console.error("Failed to fetch employees:", error)
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 })
  }
}
