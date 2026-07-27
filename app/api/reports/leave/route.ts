import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")

  if (!startDate || !endDate) {
    return NextResponse.json({ error: "Start and end dates required" }, { status: 400 })
  }

  try {
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        startDate: { gte: new Date(startDate) },
        endDate: { lte: new Date(endDate) },
      },
      include: {
        leaveType: { select: { name: true } },
        employee: {
          include: {
            department: { select: { name: true } },
          },
        },
      },
    })

    const grouped = new Map<string, any>()
    
    leaveRequests.forEach((lr) => {
      const key = `${lr.leaveType.name}|${lr.employee.department?.name || "Unassigned"}`
      const existing = grouped.get(key) || {
        leaveType: lr.leaveType.name,
        department: lr.employee.department?.name || "Unassigned",
        count: 0,
        days: 0,
      }
      
      const days = Math.ceil((lr.endDate.getTime() - lr.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      existing.count++
      existing.days += days
      grouped.set(key, existing)
    })

    const data = Array.from(grouped.values())
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch leave report:", error)
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 })
  }
}
