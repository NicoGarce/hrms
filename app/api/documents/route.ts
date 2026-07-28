import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const typeFilter = searchParams.get("type") || ""

  try {
    const employee = await prisma.employee.findFirst({
      where: { user: { email: session.user.email } },
    })

    const where: any = {}
    if (typeFilter) where.type = { contains: typeFilter, mode: "insensitive" }
    
    const userRole = session.user.role as string
    if (userRole === "EMPLOYEE" && employee) {
      where.employeeId = employee.id
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        employee: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { uploadedAt: "desc" },
    })

    const data = documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      employeeName: `${doc.employee.firstName} ${doc.employee.lastName}`,
      type: doc.type,
      uploadedAt: doc.uploadedAt.toISOString(),
      fileUrl: doc.fileUrl,
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch documents:", error)
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}
