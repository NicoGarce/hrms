import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
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
  const { status } = body

  try {
    const applicant = await prisma.applicant.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(applicant)
  } catch (error) {
    console.error("Failed to update applicant status:", error)
    return NextResponse.json({ error: "Failed to update applicant status" }, { status: 500 })
  }
}
