import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const departments = await prisma.department.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { employees: true, positions: true }
        }
      }
    })

    return NextResponse.json(departments)
  } catch (error) {
    console.error("Failed to fetch departments:", error)
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, code, description, headId } = body

    if (!name || !code) {
      return NextResponse.json({ error: "Name and code are required" }, { status: 400 })
    }

    const department = await prisma.department.create({
      data: {
        name,
        code,
        description,
        headId: headId || null,
      }
    })

    return NextResponse.json(department, { status: 201 })
  } catch (error) {
    console.error("Failed to create department:", error)
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 })
  }
}
