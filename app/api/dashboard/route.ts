import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [attendanceRaw, departmentsRaw, statusesRaw] = await Promise.all([
    prisma.attendance.groupBy({
      by: ["date"],
      where: { date: { gte: sevenDaysAgo } },
      _count: { id: true },
    }),
    prisma.department.findMany({
      include: {
        _count: {
          select: {
            employees: { where: { deletedAt: null } },
          },
        },
      },
    }),
    prisma.employee.groupBy({
      by: ["status"],
      where: { deletedAt: null },
      _count: { id: true },
    }),
  ])

  const attendance = attendanceRaw.map((a) => ({
    date: a.date.toISOString().split("T")[0],
    count: a._count.id,
  }))

  const departments = departmentsRaw.map((d) => ({
    name: d.name,
    value: d._count.employees,
  }))

  const statuses = statusesRaw.map((s) => ({
    status: s.status,
    count: s._count.id,
  }))

  return NextResponse.json({ attendance, departments, statuses })
}