import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userRole = session.user.role as string
  if (userRole !== "SUPER_ADMINISTRATOR" && userRole !== "HR_ADMINISTRATOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const year = searchParams.get("year")

  if (!year) {
    return NextResponse.json({ error: "Year required" }, { status: 400 })
  }

  try {
    const payrolls = await prisma.payroll.findMany({
      where: { year: parseInt(year) },
      include: {
        employee: {
          include: {
            department: { select: { name: true } },
          },
        },
      },
    })

    const grouped = new Map<string, any>()
    
    payrolls.forEach((p) => {
      const key = `${p.employee.department?.name || "Unassigned"}|${p.month}`
      const existing = grouped.get(key) || {
        department: p.employee.department?.name || "Unassigned",
        month: p.month,
        year: p.year,
        totalCost: 0,
        employeeCount: 0,
      }
      
      existing.totalCost += parseFloat(p.netSalary.toString())
      existing.employeeCount++
      grouped.set(key, existing)
    })

    const data = Array.from(grouped.values()).map((row) => ({
      ...row,
      totalCost: row.totalCost.toString(),
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch payroll report:", error)
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 })
  }
}
