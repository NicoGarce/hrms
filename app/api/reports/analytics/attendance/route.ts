import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const now = new Date()
    const data = []

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1)
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0)

      const attendance = await prisma.attendance.findMany({
        where: {
          date: { gte: startOfMonth, lte: endOfMonth },
        },
      })

      const present = attendance.filter((a) => a.status === "PRESENT").length
      const rate = attendance.length > 0 ? (present / attendance.length) * 100 : 0

      data.push({
        period: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        value: Math.round(rate),
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch attendance analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
