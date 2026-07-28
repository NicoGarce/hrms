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
    const settings = await prisma.companySetting.findFirst()
    
    if (!settings) {
      return NextResponse.json({
        companyName: "",
        address: "",
        phone: "",
        email: "",
        logoUrl: "",
        timezone: "UTC",
        currency: "USD",
        theme: "teal",
      })
    }

    return NextResponse.json({
      companyName: settings.companyName,
      address: settings.address,
      phone: settings.phone,
      email: settings.email,
      logoUrl: settings.logoUrl,
      timezone: settings.timezone,
      currency: settings.currency,
      theme: settings.theme,
    })
  } catch (error) {
    console.error("Failed to fetch company settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userRole = session.user.role as string
  if (userRole !== "SUPER_ADMINISTRATOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()

  try {
    const existing = await prisma.companySetting.findFirst()

    if (existing) {
      const settings = await prisma.companySetting.update({
        where: { id: existing.id },
        data: body,
      })
      return NextResponse.json(settings)
    } else {
      const settings = await prisma.companySetting.create({
        data: body,
      })
      return NextResponse.json(settings)
    }
  } catch (error) {
    console.error("Failed to update company settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
