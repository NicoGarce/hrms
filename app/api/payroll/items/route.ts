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
    const items = await prisma.payrollItem.findMany({
      include: {
        payroll: {
          include: {
            employee: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const data = items.map((item) => ({
      id: item.id,
      payrollId: item.payrollId,
      payrollPeriod: `${item.payroll.year}-${String(item.payroll.month).padStart(2, "0")}`,
      employeeName: `${item.payroll.employee.firstName} ${item.payroll.employee.lastName}`,
      type: item.type,
      name: item.name,
      amount: item.amount.toString(),
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch payroll items:", error)
    return NextResponse.json({ error: "Failed to fetch payroll items" }, { status: 500 })
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
  const { payrollId, type, name, amount } = body

  if (!payrollId || !type || !name || !amount) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const item = await prisma.payrollItem.create({
      data: {
        payrollId,
        type: type as any,
        name,
        amount,
      },
    })
    return NextResponse.json(item)
  } catch (error) {
    console.error("Failed to create payroll item:", error)
    return NextResponse.json({ error: "Failed to create payroll item" }, { status: 500 })
  }
}
