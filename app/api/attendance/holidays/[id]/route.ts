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
  const { name, date, type } = body

  try {
    const holiday = await prisma.holiday.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(date && { date: new Date(date) }),
        ...(type && { type }),
      },
    })
    return NextResponse.json(holiday)
  } catch (error) {
    console.error("Failed to update holiday:", error)
    return NextResponse.json({ error: "Failed to update holiday" }, { status: 500 })
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
    await prisma.holiday.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete holiday:", error)
    return NextResponse.json({ error: "Failed to delete holiday" }, { status: 500 })
  }
}
