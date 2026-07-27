import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, departmentId, level, description } = body

    const position = await prisma.position.update({
      where: { id },
      data: {
        title,
        departmentId,
        level,
        description,
      }
    })

    return NextResponse.json(position)
  } catch (error) {
    console.error("Failed to update position:", error)
    return NextResponse.json({ error: "Failed to update position" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await prisma.position.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete position:", error)
    return NextResponse.json({ error: "Failed to delete position" }, { status: 500 })
  }
}
