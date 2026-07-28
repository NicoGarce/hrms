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

  try {
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { employee: { select: { departmentId: true } } },
    })

    if (!leaveRequest) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 })
    }

    if (userRole === "DEPARTMENT_HEAD") {
      const headEmployee = await prisma.employee.findFirst({
        where: { user: { email: session.user.email } },
        select: { departmentId: true },
      })
      if (!headEmployee || headEmployee.departmentId !== leaveRequest.employee.departmentId) {
        return NextResponse.json({ error: "Forbidden — not your department" }, { status: 403 })
      }
      if (leaveRequest.status !== "PENDING") {
        return NextResponse.json({ error: "Can only approve pending requests" }, { status: 400 })
      }
    }

    if (userRole === "HR_ADMINISTRATOR" && leaveRequest.status !== "DEPARTMENT_APPROVED") {
      return NextResponse.json({ error: "Request must be approved by Department Head first" }, { status: 400 })
    }

    const nextStatus =
      userRole === "SUPER_ADMINISTRATOR"
        ? "APPROVED"
        : userRole === "HR_ADMINISTRATOR"
          ? "APPROVED"
          : "DEPARTMENT_APPROVED"

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: { status: nextStatus, approvedBy: session.user.id },
    })

    logAudit({
      userId: session.user.id,
      action: "APPROVE",
      resource: "leave_request",
      resourceId: id,
      details: { newStatus: nextStatus },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to approve leave request:", error)
    return NextResponse.json({ error: "Failed to approve leave request" }, { status: 500 })
  }
}
