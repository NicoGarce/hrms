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

  try {
    const holidays = await prisma.holiday.findMany({
      orderBy: { date: "asc" },
    })
    return NextResponse.json(holidays)
  } catch (error) {
    console.error("Failed to fetch holidays:", error)
    return NextResponse.json({ error: "Failed to fetch holidays" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userRole = session.user.role as string
  if (userRole !== "SUPER_ADMINISTRATOR" && userRole !== "HR_ADMINISTRATOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { name, date, type } = body

  if (!name || !date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const holiday = await prisma.holiday.create({
      data: {
        name,
        date: new Date(date),
        type: type || "PUBLIC",
      },
    })
    return NextResponse.json(holiday)
  } catch (error) {
    console.error("Failed to create holiday:", error)
    return NextResponse.json({ error: "Failed to create holiday" }, { status: 500 })
  }
}
