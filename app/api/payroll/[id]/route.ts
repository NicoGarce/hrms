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
  const { baseSalary, grossSalary, netSalary, status } = body

  try {
    const payroll = await prisma.payroll.update({
      where: { id },
      data: {
        ...(baseSalary && { baseSalary }),
        ...(grossSalary && { grossSalary }),
        ...(netSalary && { netSalary }),
        ...(status && { status }),
      },
    })
    return NextResponse.json(payroll)
  } catch (error) {
    console.error("Failed to update payroll:", error)
    return NextResponse.json({ error: "Failed to update payroll" }, { status: 500 })
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
    await prisma.payroll.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete payroll:", error)
    return NextResponse.json({ error: "Failed to delete payroll" }, { status: 500 })
  }
}
