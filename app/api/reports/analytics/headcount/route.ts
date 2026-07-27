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
      select: { createdAt: true },
    })

    const monthlyData = new Map<string, number>()
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
      monthlyData.set(key, 0)
    }

    employees.forEach((emp) => {
      const empDate = new Date(emp.createdAt)
      const key = empDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
      if (monthlyData.has(key)) {
        monthlyData.set(key, (monthlyData.get(key) || 0) + 1)
      }
    })

    let cumulative = 0
    const data = Array.from(monthlyData.entries()).map(([period, count]) => {
      cumulative += count
      return { period, value: cumulative }
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch headcount analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
