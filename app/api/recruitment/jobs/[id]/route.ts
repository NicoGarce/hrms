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
  const { title, departmentId, description, requirements, status } = body

  try {
    const job = await prisma.recruitmentJob.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(departmentId && { departmentId }),
        ...(description && { description }),
        ...(requirements && { requirements }),
        ...(status && { status }),
        ...(status === "CLOSED" && { closedAt: new Date() }),
      },
    })
    return NextResponse.json(job)
  } catch (error) {
    console.error("Failed to update job:", error)
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 })
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
    await prisma.recruitmentJob.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete job:", error)
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 })
  }
}
