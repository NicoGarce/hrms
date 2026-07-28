import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userRole = session.user.role as string
  if (userRole !== "SUPER_ADMINISTRATOR" && userRole !== "HR_ADMINISTRATOR" && userRole !== "DEPARTMENT_HEAD") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const { reason } = body

  try {
    const existingRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { employee: { select: { departmentId: true } } },
    })

    if (!existingRequest) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 })
    }

    if (userRole === "DEPARTMENT_HEAD") {
      const headEmployee = await prisma.employee.findFirst({
        where: { user: { email: session.user.email } },
        select: { departmentId: true },
      })
      if (!headEmployee || headEmployee.departmentId !== existingRequest.employee.departmentId) {
        return NextResponse.json({ error: "Forbidden — not your department" }, { status: 403 })
      }
    }

    const leaveRequest = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        reason: `${existingRequest.reason}\n\nRejected by ${userRole}: ${reason}`,
        approvedBy: session.user.id,
      },
    })

    logAudit({
      userId: session.user.id,
      action: "REJECT",
      resource: "leave_request",
      resourceId: id,
      details: { reason },
    })

    return NextResponse.json(leaveRequest)
  } catch (error) {
    console.error("Failed to reject leave request:", error)
    return NextResponse.json({ error: "Failed to reject leave request" }, { status: 500 })
  }
}
