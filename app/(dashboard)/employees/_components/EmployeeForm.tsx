"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Save, ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  employeeFormSchema,
  type EmployeeFormValues,
} from "../_lib/schema"
import {
  createEmployee,
  updateEmployee,
  deleteEmployee,
  type ActionResult,
} from "../_actions/employee-actions"

interface SelectOption {
  id: string
  name: string
  departmentId?: string
}

interface EmployeeFormProps {
  departments: SelectOption[]
  positions: SelectOption[]
  defaultValues?: EmployeeFormValues
  employeeId?: string
  mode: "create" | "edit"
}

export function EmployeeForm({
  departments,
  positions,
  defaultValues,
  employeeId,
  mode,
}: EmployeeFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: defaultValues ?? {
      firstName: "",
      lastName: "",
      email: "",
      phone: undefined,
      departmentId: undefined,
      positionId: undefined,
      hireDate: "",
      status: "ACTIVE" as const,
    },
  })

  const selectedDepartmentId = watch("departmentId")

  const filteredPositions = positions.filter(
    (p) => !p.departmentId || p.departmentId === selectedDepartmentId
  )

  const onSubmit = useCallback(
    async (values: EmployeeFormValues) => {
      setSubmitting(true)
      let result: ActionResult

      if (mode === "create") {
        result = await createEmployee(values)
      } else if (employeeId) {
        result = await updateEmployee(employeeId, values)
      } else {
        return
      }

      if (result.success) {
        toast.success(
          mode === "create"
            ? "Employee created successfully"
            : "Employee updated successfully"
        )
        router.push(`/employees/${result.employeeId ?? employeeId}`)
      } else {
        toast.error(result.error)
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            setError(field as keyof EmployeeFormValues, {
              message: messages[0],
            })
          }
        }
      }
      setSubmitting(false)
    },
    [mode, employeeId, router, setError]
  )

  const handleDelete = useCallback(async () => {
    if (!employeeId) return
    setDeleting(true)
    const result = await deleteEmployee(employeeId)
    if (result.success) {
      toast.success("Employee deleted")
      router.push("/employees")
    } else {
      toast.error(result.error)
    }
    setDeleting(false)
    setDeleteOpen(false)
  }, [employeeId, router])

  const statusOptions = [
    { value: "ACTIVE", label: "Active" },
    { value: "ON_LEAVE", label: "On Leave" },
    { value: "TERMINATED", label: "Terminated" },
    { value: "PROBATION", label: "Probation" },
  ]

  return (
    <div className="space-y-6 p-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/employees"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight">
              {mode === "create" ? "Add Employee" : "Edit Employee"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {mode === "create"
                ? "Create a new employee record"
                : "Update employee information"}
            </p>
          </div>
        </div>
        {mode === "edit" && (
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger
              render={<Button variant="destructive" />}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Employee
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Employee</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this employee? This action
                  cannot be undone. The employee record will be soft-deleted.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  {...register("firstName")}
                  aria-invalid={!!errors.firstName}
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  {...register("lastName")}
                  aria-invalid={!!errors.lastName}
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@company.com"
                  {...register("email")}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  {...register("phone")}
                  aria-invalid={!!errors.phone}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="departmentId">Department (optional)</Label>
                <select
                  id="departmentId"
                  className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  {...register("departmentId")}
                >
                  <option value="">Select a department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {errors.departmentId && (
                  <p className="text-xs text-destructive">
                    {errors.departmentId.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="positionId">Position (optional)</Label>
                <select
                  id="positionId"
                  className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  {...register("positionId")}
                >
                  <option value="">Select a position</option>
                  {filteredPositions.map((pos) => (
                    <option key={pos.id} value={pos.id}>
                      {pos.name}
                    </option>
                  ))}
                </select>
                {errors.positionId && (
                  <p className="text-xs text-destructive">
                    {errors.positionId.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hireDate">Hire Date</Label>
                <Input
                  id="hireDate"
                  type="date"
                  {...register("hireDate")}
                  aria-invalid={!!errors.hireDate}
                />
                {errors.hireDate && (
                  <p className="text-xs text-destructive">
                    {errors.hireDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  {...register("status")}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="text-xs text-destructive">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Save className="mr-2 h-4 w-4" />
                {mode === "create" ? "Create Employee" : "Save Changes"}
              </Button>
              <Link
                href="/employees"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
