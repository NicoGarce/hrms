import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const employee = await prisma.employee.findFirst({
      where: { user: { email: session.user.email } },
      include: {
        user: { select: { email: true } },
        department: { select: { name: true } },
        position: { select: { title: true } },
        profile: true,
      },
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json({
      employeeCode: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.user.email,
      role: session.user.role,
      departmentName: employee.department?.name || null,
      positionTitle: employee.position?.title || null,
      hireDate: employee.hireDate.toISOString(),
      phone: employee.profile?.phone || null,
      address: employee.profile?.address || null,
      emergencyContact: employee.profile?.emergencyContact || null,
      dateOfBirth: employee.profile?.dateOfBirth?.toISOString() || null,
    })
  } catch (error) {
    console.error("Failed to fetch profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { phone, address } = body

  try {
    const employee = await prisma.employee.findFirst({
      where: { user: { email: session.user.email } },
      include: { profile: true },
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    if (employee.profile) {
      await prisma.employeeProfile.update({
        where: { employeeId: employee.id },
        data: {
          ...(phone !== undefined && { phone }),
          ...(address !== undefined && { address }),
        },
      })
    } else {
      await prisma.employeeProfile.create({
        data: {
          employeeId: employee.id,
          phone: phone || null,
          address: address || null,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
