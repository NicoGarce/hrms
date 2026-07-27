import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const email = searchParams.get("email")

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 })
  }

  try {
    const employee = await prisma.employee.findFirst({
      where: {
        user: { email },
        deletedAt: null,
      },
      select: {
        id: true,
        departmentId: true,
      },
    })
    return NextResponse.json(employee)
  } catch (error) {
    console.error("Failed to fetch employee:", error)
    return NextResponse.json({ error: "Failed to fetch employee" }, { status: 500 })
  }
}
