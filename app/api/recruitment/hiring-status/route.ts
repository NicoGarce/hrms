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
    const jobs = await prisma.recruitmentJob.findMany({
      select: { id: true, title: true },
    })

    const jobIds = jobs.map((j) => j.id)

    const applicantCounts = await prisma.applicant.groupBy({
      by: ["jobId", "status"],
      _count: true,
      where: { jobId: { in: jobIds } },
    })

    const statusMap = new Map<string, Record<string, number>>()
    applicantCounts.forEach((ac) => {
      if (!statusMap.has(ac.jobId)) {
        statusMap.set(ac.jobId, {})
      }
      statusMap.get(ac.jobId)![ac.status] = ac._count
    })

    const data = jobs.map((job) => {
      const counts = statusMap.get(job.id) || {}
      return {
        jobTitle: job.title,
        jobId: job.id,
        applied: counts.APPLIED || 0,
        screening: counts.SCREENING || 0,
        interview: counts.INTERVIEW || 0,
        offer: counts.OFFER || 0,
        hired: counts.HIRED || 0,
        rejected: counts.REJECTED || 0,
      }
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch hiring status:", error)
    return NextResponse.json({ error: "Failed to fetch hiring status" }, { status: 500 })
  }
}
