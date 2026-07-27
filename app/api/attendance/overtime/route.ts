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
    const attendance = await prisma.attendance.findMany({
      where: {
        date: { gte: monthStart, lte: monthEnd },
        overtimeHours: { gt: 0 },
        employee: {
          deletedAt: null,
          status: "ACTIVE",
          ...(role === "DEPARTMENT_HEAD" && departmentId && { departmentId }),
        },
      },
      include: {
        employee: {
          include: {
            department: { select: { name: true } },
          },
        },
      },
      orderBy: { overtimeHours: "desc" },
    })

    const data = attendance.map((att) => ({
      id: att.id,
      employeeCode: att.employee.employeeCode,
      firstName: att.employee.firstName,
      lastName: att.employee.lastName,
      departmentName: att.employee.department?.name || null,
      date: att.date.toISOString(),
      overtimeHours: att.overtimeHours || 0,
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch overtime records:", error)
    return NextResponse.json({ error: "Failed to fetch overtime records" }, { status: 500 })
  }
}
