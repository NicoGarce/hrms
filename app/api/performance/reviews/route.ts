import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const reviews = await prisma.performanceReview.findMany({
      include: {
        employee: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const data = reviews.map((review) => ({
      id: review.id,
      employeeName: `${review.employee.firstName} ${review.employee.lastName}`,
      reviewerName: "Current User",
      reviewPeriod: review.reviewPeriod,
      rating: review.rating,
      status: review.status,
      createdAt: review.createdAt.toISOString(),
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { employeeId, reviewPeriod, rating, goals, kpis, feedback, isDraft } = body

  if (!employeeId || !reviewPeriod || !feedback) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const employee = await prisma.employee.findFirst({
      where: { user: { email: session.user.email } },
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    const review = await prisma.performanceReview.create({
      data: {
        employeeId,
        reviewerId: employee.id,
        reviewPeriod,
        rating,
        goals,
        kpis: kpis ? JSON.parse(kpis) : null,
        feedback,
        status: isDraft ? "DRAFT" : "SUBMITTED",
      },
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error("Failed to create review:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}
