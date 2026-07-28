import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(req.url)
  const q = url.searchParams.get("q") || ""

  if (q.length < 1) {
    return NextResponse.json({ employees: [], departments: [], positions: [], leaveTypes: [] })
  }

  const userRole = session.user.role as string

  try {
    const [employees, departments, positions, leaveTypes] = await Promise.all([
      prisma.employee.findMany({
        where: {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { employeeCode: { contains: q, mode: "insensitive" } },
            { user: { email: { contains: q, mode: "insensitive" } } },
          ],
          deletedAt: null,
        },
        select: { id: true, firstName: true, lastName: true, employeeCode: true },
        take: 5,
      }),

      prisma.department.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { code: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, code: true },
        take: 5,
      }),

      prisma.position.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, title: true, department: { select: { name: true } } },
        take: 5,
      }),

      prisma.leaveType.findMany({
        where: { name: { contains: q, mode: "insensitive" } },
        select: { id: true, name: true, daysAllowed: true },
        take: 5,
      }),
    ])

    return NextResponse.json({ employees, departments, positions, leaveTypes })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ employees: [], departments: [], positions: [], leaveTypes: [] })
  }
}
