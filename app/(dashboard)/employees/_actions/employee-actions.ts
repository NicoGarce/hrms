"use server"

import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
import { employeeFormSchema, type EmployeeFormValues } from "../_lib/schema"

export type ActionResult =
  | { success: true; employeeId?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

export async function createEmployee(data: EmployeeFormValues): Promise<ActionResult> {
  try {
    const parsed = employeeFormSchema.safeParse(data)
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {}
      for (const issue of parsed.error.issues) {
        const path = issue.path.join(".")
        if (!fieldErrors[path]) fieldErrors[path] = []
        fieldErrors[path].push(issue.message)
      }
      return { success: false, error: "Validation failed", fieldErrors }
    }

    const vals = parsed.data
    const firstName = vals.firstName
    const lastName = vals.lastName
    const email = vals.email
    const phone = vals.phone || null
    const departmentId = vals.departmentId || null
    const positionId = vals.positionId || null
    const hireDate = vals.hireDate
    const status = vals.status

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return {
        success: false,
        error: "A user with this email already exists",
        fieldErrors: { email: ["Email already in use"] },
      }
    }

    const employeeRole = await prisma.role.findUnique({ where: { name: "EMPLOYEE" } })
    if (!employeeRole) {
      return { success: false, error: "Employee role not configured in the system" }
    }

    const count = await prisma.employee.count()
    const employeeCode = `EMP-${String(count + 1).padStart(5, "0")}`
    const tempPassword = await bcrypt.hash(crypto.randomUUID(), 10)

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: tempPassword,
          roleId: employeeRole.id,
        },
      })

      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          employeeCode,
          firstName,
          lastName,
          departmentId,
          positionId,
          hireDate: new Date(hireDate),
          status,
        },
      })

      if (phone) {
        await tx.employeeProfile.create({
          data: {
            employeeId: employee.id,
            phone,
          },
        })
      }

      return employee
    })

    const session = await auth()
    await logAudit({
      userId: session?.user?.id,
      action: "CREATE",
      resource: "employee",
      resourceId: result.id,
      details: { firstName, lastName, employeeCode },
    })

    revalidatePath("/employees")
    return { success: true, employeeId: result.id }
  } catch (error) {
    console.error("Failed to create employee:", error)
    return { success: false, error: "An unexpected error occurred. Please try again." }
  }
}

export async function updateEmployee(
  id: string,
  data: EmployeeFormValues
): Promise<ActionResult> {
  try {
    const existing = await prisma.employee.findUnique({ where: { id } })
    if (!existing || existing.deletedAt) {
      return { success: false, error: "Employee not found" }
    }

    const parsed = employeeFormSchema.safeParse(data)
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {}
      for (const issue of parsed.error.issues) {
        const path = issue.path.join(".")
        if (!fieldErrors[path]) fieldErrors[path] = []
        fieldErrors[path].push(issue.message)
      }
      return { success: false, error: "Validation failed", fieldErrors }
    }

    const vals = parsed.data
    const firstName = vals.firstName
    const lastName = vals.lastName
    const email = vals.email
    const phone = vals.phone || null
    const departmentId = vals.departmentId || null
    const positionId = vals.positionId || null
    const hireDate = vals.hireDate
    const status = vals.status

    const emailOwner = await prisma.user.findUnique({ where: { email } })
    if (emailOwner && emailOwner.id !== existing.userId) {
      return {
        success: false,
        error: "Email is already in use by another user",
        fieldErrors: { email: ["Email already in use"] },
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: existing.userId },
        data: { email },
      })

      await tx.employee.update({
        where: { id },
        data: {
          firstName,
          lastName,
          departmentId,
          positionId,
          hireDate: new Date(hireDate),
          status,
        },
      })

      if (phone) {
        await tx.employeeProfile.upsert({
          where: { employeeId: id },
          create: { employeeId: id, phone },
          update: { phone },
        })
      }
    })

    const session = await auth()
    await logAudit({
      userId: session?.user?.id,
      action: "UPDATE",
      resource: "employee",
      resourceId: id,
      details: { firstName, lastName },
    })

    revalidatePath("/employees")
    return { success: true, employeeId: id }
  } catch (error) {
    console.error("Failed to update employee:", error)
    return { success: false, error: "An unexpected error occurred. Please try again." }
  }
}

export async function deleteEmployee(id: string): Promise<ActionResult> {
  try {
    const existing = await prisma.employee.findUnique({ where: { id } })
    if (!existing || existing.deletedAt) {
      return { success: false, error: "Employee not found" }
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: existing.userId },
        data: { deletedAt: new Date() },
      }),
      prisma.employee.update({
        where: { id },
        data: { deletedAt: new Date() },
      }),
    ])

    const session = await auth()
    await logAudit({
      userId: session?.user?.id,
      action: "DELETE",
      resource: "employee",
      resourceId: id,
      details: { firstName: existing.firstName, lastName: existing.lastName },
    })

    revalidatePath("/employees")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete employee:", error)
    return { success: false, error: "An unexpected error occurred. Please try again." }
  }
}
