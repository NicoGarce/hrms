import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const employee = await prisma.employee.findFirst({
      where: { user: { email: session.user.email } },
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    const payrolls = await prisma.payroll.findMany({
      where: { employeeId: employee.id },
      include: { items: true },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    })

    const data = payrolls.map((p) => ({
      id: p.id,
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
    console.error("Failed to fetch payslips:", error)
    return NextResponse.json({ error: "Failed to fetch payslips" }, { status: 500 })
  }
}
