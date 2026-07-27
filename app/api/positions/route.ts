import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const positions = await prisma.position.findMany({
      where: { deletedAt: null },
      orderBy: { title: "asc" },
      include: {
        department: true,
        _count: {
          select: { employees: true }
        }
      }
    })

    return NextResponse.json(positions)
  } catch (error) {
    console.error("Failed to fetch positions:", error)
    return NextResponse.json({ error: "Failed to fetch positions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, departmentId, level, description } = body

    if (!title || !departmentId) {
      return NextResponse.json({ error: "Title and department are required" }, { status: 400 })
    }

    const position = await prisma.position.create({
      data: {
        title,
        departmentId,
        level: level || "MID",
        description,
      }
    })

    return NextResponse.json(position, { status: 201 })
  } catch (error) {
    console.error("Failed to create position:", error)
    return NextResponse.json({ error: "Failed to create position" }, { status: 500 })
  }
}
