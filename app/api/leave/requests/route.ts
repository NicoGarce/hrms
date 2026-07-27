import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const statusFilter = searchParams.get("status") || "ALL"

  try {
    const where: any = {
      ...(statusFilter !== "ALL" && { status: statusFilter }),
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where,
      include: {
        employee: {
          include: {
            department: { select: { name: true } },
          },
        },
        leaveType: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const data = leaveRequests.map((lr) => ({
      id: lr.id,
      employeeId: lr.employeeId,
      employeeName: `${lr.employee.firstName} ${lr.employee.lastName}`,
      employeeCode: lr.employee.employeeCode,
      leaveTypeName: lr.leaveType.name,
      startDate: lr.startDate.toISOString(),
      endDate: lr.endDate.toISOString(),
      reason: lr.reason,
      status: lr.status,
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch leave requests:", error)
    return NextResponse.json({ error: "Failed to fetch leave requests" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { leaveTypeId, startDate, endDate, reason } = body

  if (!leaveTypeId || !startDate || !endDate || !reason) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    // Get employee from user
    const employee = await prisma.employee.findFirst({
      where: { user: { email: session.user.email } },
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId: employee.id,
        leaveTypeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
      },
    })

    return NextResponse.json(leaveRequest)
  } catch (error) {
    console.error("Failed to create leave request:", error)
    return NextResponse.json({ error: "Failed to create leave request" }, { status: 500 })
  }
}
