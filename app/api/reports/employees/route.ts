import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const employees = await prisma.employee.findMany({
      where: { deletedAt: null },
      include: {
        department: { select: { name: true } },
        position: { select: { title: true } },
      },
    })

    const grouped = new Map<string, EmployeeReport>()
    
    employees.forEach((emp) => {
      const key = `${emp.department?.name || "Unassigned"}|${emp.position?.title || "Unassigned"}|${emp.status}`
      const existing = grouped.get(key) || {
        department: emp.department?.name || "Unassigned",
        position: emp.position?.title || "Unassigned",
        status: emp.status,
        count: 0,
      }
      existing.count++
      grouped.set(key, existing)
    })

    const data = Array.from(grouped.values())
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch employees report:", error)
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 })
  }
}

interface EmployeeReport {
  department: string
  position: string
  status: string
  count: number
}
