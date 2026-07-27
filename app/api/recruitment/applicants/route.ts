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

  const { searchParams } = new URL(req.url)
  const jobId = searchParams.get("jobId") || ""
  const statusFilter = searchParams.get("status") || "ALL"

  try {
    const where: any = {}
    if (jobId) where.jobId = jobId
    if (statusFilter !== "ALL") where.status = statusFilter

    const applicants = await prisma.applicant.findMany({
      where,
      include: {
        job: {
          select: { title: true },
        },
      },
      orderBy: { appliedAt: "desc" },
    })

    const data = applicants.map((app) => ({
      id: app.id,
      firstName: app.firstName,
      lastName: app.lastName,
      email: app.email,
      phone: app.phone,
      jobTitle: app.job.title,
      jobId: app.jobId,
      status: app.status,
      appliedAt: app.appliedAt.toISOString(),
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch applicants:", error)
    return NextResponse.json({ error: "Failed to fetch applicants" }, { status: 500 })
  }
}
