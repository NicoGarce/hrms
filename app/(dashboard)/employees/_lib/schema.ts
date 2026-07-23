import { z } from "zod"

export const employeeFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  positionId: z.string().optional().nullable(),
  hireDate: z.string().min(1, "Hire date is required"),
  status: z.enum(["ACTIVE", "ON_LEAVE", "TERMINATED", "PROBATION"]),
})

export type EmployeeFormValues = z.input<typeof employeeFormSchema>
