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
    const attendance = await prisma.attendance.findMany({
      where: {
        date: { gte: new Date(startDate), lte: new Date(endDate) },
      },
    })

    const grouped = new Map<string, any>()
    
    attendance.forEach((att) => {
      const dateStr = att.date.toISOString().split("T")[0]
      const existing = grouped.get(dateStr) || {
        date: dateStr,
        present: 0,
        absent: 0,
        late: 0,
        halfDay: 0,
        total: 0,
      }
      
      if (att.status === "PRESENT") existing.present++
      else if (att.status === "ABSENT") existing.absent++
      else if (att.status === "LATE") existing.late++
      else if (att.status === "HALF_DAY") existing.halfDay++
      
      existing.total++
      grouped.set(dateStr, existing)
    })

    const data = Array.from(grouped.values()).map((row) => ({
      ...row,
      rate: row.total > 0 ? (row.present / row.total) * 100 : 0,
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch attendance report:", error)
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 })
  }
}
