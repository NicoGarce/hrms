import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const dateStart = new Date(searchParams.get("dateStart") || "")
  const dateEnd = new Date(searchParams.get("dateEnd") || "")
  const role = searchParams.get("role") || ""
  const departmentId = searchParams.get("departmentId") || null
  const employeeFilter = searchParams.get("employeeFilter") || ""

  try {
    const attendance = await prisma.attendance.findMany({
      where: {
        date: { gte: dateStart, lte: dateEnd },
        checkIn: { not: null },
        employee: {
          deletedAt: null,
          status: "ACTIVE",
          ...(role === "DEPARTMENT_HEAD" && departmentId && { departmentId }),
          ...(employeeFilter && {
            OR: [
              { firstName: { contains: employeeFilter, mode: "insensitive" } },
              { lastName: { contains: employeeFilter, mode: "insensitive" } },
              { employeeCode: { contains: employeeFilter, mode: "insensitive" } },
            ],
          }),
        },
      },
      include: {
        employee: {
          include: {
            department: { select: { name: true } },
          },
        },
      },
      orderBy: { checkIn: "asc" },
    })

    const data = attendance.map((att) => {
      let duration = null
      if (att.checkIn && att.checkOut) {
        const minutes = differenceInMinutes(new Date(att.checkOut), new Date(att.checkIn))
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        duration = `${hours}h ${mins}m`
      }

      return {
        id: att.id,
        employeeCode: att.employee.employeeCode,
        firstName: att.employee.firstName,
        lastName: att.employee.lastName,
        departmentName: att.employee.department?.name || null,
        date: att.date.toISOString(),
        checkIn: att.checkIn?.toISOString() || null,
        checkOut: att.checkOut?.toISOString() || null,
        duration,
      }
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch time logs:", error)
    return NextResponse.json({ error: "Failed to fetch time logs" }, { status: 500 })
  }
}

function differenceInMinutes(date1: Date, date2: Date): number {
  const diffMs = date1.getTime() - date2.getTime()
  return Math.floor(diffMs / 60000)
}
