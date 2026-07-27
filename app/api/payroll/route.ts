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
    const payrolls = await prisma.payroll.findMany({
      include: {
        employee: {
          select: { firstName: true, lastName: true, employeeCode: true },
          include: {
            department: { select: { name: true } },
          },
        },
        items: true,
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    })

    const data = payrolls.map((p) => ({
      id: p.id,
      employeeName: `${p.employee.firstName} ${p.employee.lastName}`,
      employeeCode: p.employee.employeeCode,
      department: p.employee.department?.name,
      month: p.month,
      year: p.year,
      baseSalary: p.baseSalary.toString(),
      grossSalary: p.grossSalary.toString(),
      netSalary: p.netSalary.toString(),
      status: p.status,
      items: p.items.map((item) => ({
        type: item.type,
        name: item.name,
        amount: item.amount.toString(),
      })),
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch payrolls:", error)
    return NextResponse.json({ error: "Failed to fetch payrolls" }, { status: 500 })
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
  const { employeeId, month, year, baseSalary, grossSalary, netSalary, status } = body

  if (!employeeId || !month || !year || !baseSalary || !grossSalary || !netSalary) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const payroll = await prisma.payroll.create({
      data: {
        employeeId,
        month,
        year,
        baseSalary,
        grossSalary,
        netSalary,
        status: status || "DRAFT",
      },
    })
    return NextResponse.json(payroll)
  } catch (error) {
    console.error("Failed to create payroll:", error)
    return NextResponse.json({ error: "Failed to create payroll" }, { status: 500 })
  }
}
