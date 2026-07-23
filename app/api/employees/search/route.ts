import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q") || ""

  if (q.length < 2) {
    return NextResponse.json([])
  }

  const employees = await prisma.employee.findMany({
    where: {
      OR: [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
      ],
      deletedAt: null,
    },
    take: 10,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      employeeCode: true,
    },
  })

  return NextResponse.json(employees)
}