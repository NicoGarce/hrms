import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userRole = session.user.role as string
  if (userRole !== "SUPER_ADMINISTRATOR" && userRole !== "HR_ADMINISTRATOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const { name, daysAllowed, carryForward } = body

  try {
    const leaveType = await prisma.leaveType.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(daysAllowed && { daysAllowed }),
        ...(carryForward !== undefined && { carryForward }),
      },
    })
    return NextResponse.json(leaveType)
  } catch (error) {
    console.error("Failed to update leave type:", error)
    return NextResponse.json({ error: "Failed to update leave type" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userRole = session.user.role as string
  if (userRole !== "SUPER_ADMINISTRATOR" && userRole !== "HR_ADMINISTRATOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  try {
    await prisma.leaveType.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete leave type:", error)
    return NextResponse.json({ error: "Failed to delete leave type" }, { status: 500 })
  }
}
