import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { format, startOfDay, endOfDay } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, Check, X, Clock } from "lucide-react"
import { updateAttendanceStatus } from "./actions"
import { AttendanceDatePicker } from "./_components/AttendanceDatePicker"
import Link from "next/link"

interface AttendancePageProps {
  searchParams: Promise<{ date?: string }>
}

export default async function AttendancePage({ searchParams }: AttendancePageProps) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const sp = await searchParams
  const userRole = session.user.role as string
  const selectedDate = sp.date ? new Date(sp.date) : new Date()
  const dateStart = startOfDay(selectedDate)
  const dateEnd = endOfDay(selectedDate)

  // Check if selected date is a holiday
  const holiday = await prisma.holiday.findUnique({
    where: { date: dateStart },
  })

  // Get departmentId for DEPARTMENT_HEAD
  let departmentId: string | null = null
  if (userRole === "DEPARTMENT_HEAD") {
    const employee = await prisma.employee.findFirst({
      where: { user: { email: session.user.email } },
      select: { departmentId: true },
    })
    departmentId = employee?.departmentId || null
  }

  // Get employees based on role
  const employees = await prisma.employee.findMany({
    where: {
      deletedAt: null,
      status: "ACTIVE",
      ...(userRole === "DEPARTMENT_HEAD" && departmentId && {
        departmentId,
      }),
    },
    include: {
      user: { select: { email: true } },
      department: { select: { name: true } },
      attendance: {
        where: { date: dateStart },
      },
    },
    orderBy: { lastName: "asc" },
  })

  // Get leave requests for this date
  const leaveRequests = await prisma.leaveRequest.findMany({
    where: {
      status: "APPROVED",
      startDate: { lte: dateEnd },
      endDate: { gte: dateStart },
      ...(userRole === "DEPARTMENT_HEAD" && departmentId && {
        employee: { departmentId },
      }),
    },
    include: { employee: true },
  })

  const onLeaveEmployeeIds = new Set(leaveRequests.map((lr) => lr.employeeId))

  const canEdit = userRole === "SUPER_ADMINISTRATOR" || userRole === "HR_ADMINISTRATOR"

  const prevDay = new Date(selectedDate)
  prevDay.setDate(prevDay.getDate() - 1)
  const nextDay = new Date(selectedDate)
  nextDay.setDate(nextDay.getDate() + 1)

  return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Daily Attendance</h1>
            <p className="text-muted-foreground">Track and manage employee attendance</p>
          </div>
          {holiday && (
            <Badge variant="outline" className="gap-1">
              <Calendar className="h-3 w-3" />
              {holiday.name} (Holiday)
            </Badge>
          )}
        </div>

        <Card accent="teal">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Attendance for {format(selectedDate, "MMMM d, yyyy")}</CardTitle>
              <div className="flex items-center gap-2">
                <Link
                  href={`?date=${format(prevDay, "yyyy-MM-dd")}`}
                  className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Link>
                <AttendanceDatePicker selectedDate={selectedDate} />
                <Link
                  href={`?date=${format(nextDay, "yyyy-MM-dd")}`}
                  className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted hover:text-foreground"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Employee</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Department</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Check In</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Check Out</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    {canEdit && (
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={canEdit ? 6 : 5} className="px-4 py-8 text-center text-muted-foreground">
                        No employees found
                      </td>
                    </tr>
                  ) : (
                    employees.map((employee) => {
                      const attendance = employee.attendance[0]
                      const isOnLeave = onLeaveEmployeeIds.has(employee.id)
                      const isHoliday = !!holiday

                      let status = attendance?.status || "ABSENT"
                      let displayStatus: string = status
                      if (isOnLeave) displayStatus = "ON_LEAVE"
                      if (isHoliday && !attendance) displayStatus = "HOLIDAY"

                      const statusColors = {
                        PRESENT: "bg-chart-3 text-chart-3-foreground",
                        ABSENT: "bg-chart-4 text-chart-4-foreground",
                        LATE: "bg-chart-2 text-chart-2-foreground",
                        HALF_DAY: "bg-chart-2 text-chart-2-foreground",
                        ON_LEAVE: "bg-chart-5 text-chart-5-foreground",
                        HOLIDAY: "bg-chart-1 text-chart-1-foreground",
                      }

                      return (
                        <tr key={employee.id} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                              <div className="text-xs text-muted-foreground font-mono">{employee.employeeCode}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">{employee.department?.name || "—"}</td>
                          <td className="px-4 py-3 text-sm font-mono">
                            {attendance?.checkIn ? format(new Date(attendance.checkIn), "HH:mm:ss") : "—"}
                          </td>
                          <td className="px-4 py-3 text-sm font-mono">
                            {attendance?.checkOut ? format(new Date(attendance.checkOut), "HH:mm:ss") : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={statusColors[displayStatus as keyof typeof statusColors]}>
                              {displayStatus.replace("_", " ")}
                            </Badge>
                          </td>
                          {canEdit && !isHoliday && !isOnLeave && (
                            <td className="px-4 py-3">
                              <form action={updateAttendanceStatus} className="flex gap-1">
                                <input type="hidden" name="employeeId" value={employee.id} />
                                <input type="hidden" name="date" value={format(selectedDate, "yyyy-MM-dd")} />
                                <Button
                                  type="submit"
                                  name="status"
                                  value="PRESENT"
                                  variant="ghost"
                                  size="icon-xs"
                                  className="text-chart-3 hover:bg-chart-3/10"
                                  title="Mark Present"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="submit"
                                  name="status"
                                  value="ABSENT"
                                  variant="ghost"
                                  size="icon-xs"
                                  className="text-chart-4 hover:bg-chart-4/10"
                                  title="Mark Absent"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="submit"
                                  name="status"
                                  value="LATE"
                                  variant="ghost"
                                  size="icon-xs"
                                  className="text-chart-2 hover:bg-chart-2/10"
                                  title="Mark Late"
                                >
                                  <Clock className="h-3 w-3" />
                                </Button>
                              </form>
                            </td>
                          )}
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
