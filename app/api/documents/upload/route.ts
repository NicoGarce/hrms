import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

// NOTE: This uses local filesystem storage for development.
// Production should use cloud object storage (S3, Azure Blob, etc.)
// with proper environment variables configured.

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File
  const type = formData.get("type") as string
  const employeeId = formData.get("employeeId") as string

  if (!file || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const employee = await prisma.employee.findFirst({
      where: { user: { email: session.user.email } },
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    const userRole = session.user.role as string
    const targetEmployeeId = (userRole === "EMPLOYEE") ? employee.id : employeeId

    if (!targetEmployeeId) {
      return NextResponse.json({ error: "Employee ID required" }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name}`
    const filepath = join(uploadsDir, filename)

    // Save file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Create document record
    const document = await prisma.document.create({
      data: {
        employeeId: targetEmployeeId,
        type: type as any,
        name: file.name,
        fileUrl: `/uploads/${filename}`,
      },
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error("Failed to upload document:", error)
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 })
  }
}
