import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userRole = session.user.role as string
  if (userRole !== "SUPER_ADMINISTRATOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const users = await prisma.user.findMany({
      include: {
        role: { select: { name: true } },
        employee: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const data = users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role.name,
      employeeName: u.employee ? `${u.employee.firstName} ${u.employee.lastName}` : null,
      deletedAt: u.deletedAt?.toISOString() || null,
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
