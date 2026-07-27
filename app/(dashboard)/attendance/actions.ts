"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updateAttendanceStatus(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const userRole = session.user.role as string
  if (userRole !== "SUPER_ADMINISTRATOR" && userRole !== "HR_ADMINISTRATOR") {
    throw new Error("Forbidden")
  }

  const employeeId = formData.get("employeeId") as string
  const dateStr = formData.get("date") as string
  const status = formData.get("status") as string

  if (!employeeId || !dateStr || !status) {
    throw new Error("Missing required fields")
  }

  const date = new Date(dateStr)
  date.setHours(0, 0, 0, 0)

  try {
    // Check if attendance record exists
    const existing = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date,
        },
      },
    })

    if (existing) {
      await prisma.attendance.update({
        where: { id: existing.id },
        data: { status: status as any },
      })
    } else {
      await prisma.attendance.create({
        data: {
          employeeId,
          date,
          status: status as any,
        },
      })
    }

    revalidatePath("/attendance")
  } catch (error) {
    console.error("Failed to update attendance:", error)
    throw new Error("Failed to update attendance")
  }
}
