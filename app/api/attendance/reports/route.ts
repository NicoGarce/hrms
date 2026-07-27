import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const monthStart = new Date(searchParams.get("monthStart") || "")
  const monthEnd = new Date(searchParams.get("monthEnd") || "")
  const role = searchParams.get("role") || ""
  const departmentId = searchParams.get("departmentId") || null

  try {
    const employees = await prisma.employee.findMany({
      where: {
        deletedAt: null,
        status: "ACTIVE",
        ...(role === "DEPARTMENT_HEAD" && departmentId && { departmentId }),
      },
      include: {
        department: { select: { name: true } },
        attendance: {
          where: {
            date: { gte: monthStart, lte: monthEnd },
            status: "PRESENT",
          },
        },
      },
      orderBy: { lastName: "asc" },
    })

    const data = employees.map((emp) => ({
      id: emp.id,
      employeeCode: emp.employeeCode,
      firstName: emp.firstName,
      lastName: emp.lastName,
      departmentName: emp.department?.name || null,
      presentDays: emp.attendance.length,
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch attendance reports:", error)
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}
