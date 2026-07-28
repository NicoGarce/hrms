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
    const leaveRequest = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedBy: session.user.id,
      },
    })

    logAudit({
      userId: session.user.id,
      action: "APPROVE",
      resource: "leave_request",
      resourceId: id,
    })

    return NextResponse.json(leaveRequest)
  } catch (error) {
    console.error("Failed to approve leave request:", error)
    return NextResponse.json({ error: "Failed to approve leave request" }, { status: 500 })
  }
}
