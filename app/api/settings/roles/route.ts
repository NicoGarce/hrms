import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userRole = session.user.role as string
  if (userRole !== "SUPER_ADMINISTRATOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const rolePermissions = await prisma.rolePermission.findMany({
      include: {
        role: { select: { name: true } },
        permission: { select: { name: true, resource: true, action: true } },
      },
    })

    const data = rolePermissions.map((rp) => ({
      roleName: rp.role.name,
      permissionName: rp.permission.name,
      resource: rp.permission.resource,
      action: rp.permission.action,
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch role permissions:", error)
    return NextResponse.json({ error: "Failed to fetch permissions" }, { status: 500 })
  }
}
