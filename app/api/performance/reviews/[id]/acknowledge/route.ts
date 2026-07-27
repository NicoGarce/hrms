import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const review = await prisma.performanceReview.update({
      where: { id },
      data: { status: "REVIEWED" },
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error("Failed to acknowledge review:", error)
    return NextResponse.json({ error: "Failed to acknowledge review" }, { status: 500 })
  }
}
