import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const leaveTypes = await prisma.leaveType.findMany({
      orderBy: { name: "asc" },
    })
    return NextResponse.json(leaveTypes)
  } catch (error) {
    console.error("Failed to fetch leave types:", error)
    return NextResponse.json({ error: "Failed to fetch leave types" }, { status: 500 })
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
  const { name, daysAllowed, carryForward } = body

  if (!name || !daysAllowed) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const leaveType = await prisma.leaveType.create({
      data: {
        name,
        daysAllowed,
        carryForward: carryForward || false,
      },
    })
    return NextResponse.json(leaveType)
  } catch (error) {
    console.error("Failed to create leave type:", error)
    return NextResponse.json({ error: "Failed to create leave type" }, { status: 500 })
  }
}
