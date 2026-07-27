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
      orderBy: { postedAt: "desc" },
    })

    const departmentIds = jobs.map((j) => j.departmentId).filter(Boolean) as string[]
    const departments = await prisma.department.findMany({
      where: { id: { in: departmentIds } },
      select: { id: true, name: true },
    })

    const departmentMap = new Map(departments.map((d) => [d.id, d.name]))

    const applicantCounts = await prisma.applicant.groupBy({
      by: ["jobId"],
      _count: true,
      where: { jobId: { in: jobs.map((j) => j.id) } },
    })

    const countMap = new Map(applicantCounts.map((ac) => [ac.jobId, ac._count]))

    const data = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      departmentName: job.departmentId ? departmentMap.get(job.departmentId) || null : null,
      status: job.status,
      applicantCount: countMap.get(job.id) || 0,
      postedAt: job.postedAt.toISOString(),
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch jobs:", error)
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
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
  const { title, departmentId, description, requirements, status } = body

  if (!title || !departmentId || !description || !requirements) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const job = await prisma.recruitmentJob.create({
      data: {
        title,
        departmentId,
        description,
        requirements,
        status: status || "OPEN",
      },
    })
    return NextResponse.json(job)
  } catch (error) {
    console.error("Failed to create job:", error)
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 })
  }
}
