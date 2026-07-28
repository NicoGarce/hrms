"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from "date-fns"

interface LeaveRequest {
  id: string
  employeeName: string
  leaveTypeName: string
  startDate: string
  endDate: string
  leaveTypeId: string
}

export default function LeaveCalendarPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const user = session?.user
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date())

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (user) { fetchLeaveRequests() }
  }, [status, user, selectedMonth])

  const fetchLeaveRequests = async () => {
    setLoading(true)
    const monthStart = startOfMonth(selectedMonth)
    const monthEnd = endOfMonth(selectedMonth)

    try {
      const response = await fetch(`/api/leave/requests?status=APPROVED`)
      const data = await response.json()
      
      // Filter for the selected month
      const filtered = data.filter((lr: LeaveRequest) => {
        const start = new Date(lr.startDate)
        const end = new Date(lr.endDate)
        return start <= monthEnd && end >= monthStart
      })
      
      setLeaveRequests(filtered)
    } catch (error) {
      console.error("Failed to fetch leave requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const getLeaveForDay = (date: Date) => {
    return leaveRequests.filter((lr) => {
      const start = new Date(lr.startDate)
      const end = new Date(lr.endDate)
      return date >= start && date <= end
    })
  }

  const getLeaveTypeColor = (leaveTypeId: string) => {
    const colors = [
      "bg-chart-1",
      "bg-chart-2",
      "bg-chart-3",
      "bg-chart-4",
      "bg-chart-5",
    ]
    const index = parseInt(leaveTypeId.slice(-1), 16) % colors.length
    return colors[index]
  }

  const calendarDays: Date[] = []
  let currentDay = startOfWeek(startOfMonth(selectedMonth))
  const lastDay = endOfWeek(endOfMonth(selectedMonth))
  while (currentDay <= lastDay) {
    calendarDays.push(currentDay)
    currentDay = addDays(currentDay, 1)
  }

  const prevMonth = new Date(selectedMonth)
  prevMonth.setMonth(prevMonth.getMonth() - 1)
  const nextMonth = new Date(selectedMonth)
  nextMonth.setMonth(nextMonth.getMonth() + 1)

  if (!user) return null

  return (
      <div className="space-y-6 p-8">
        <div>
          <h1 className="font-heading text-2xl font-bold">Leave Calendar</h1>
          <p className="text-muted-foreground">View approved leave requests by month</p>
        </div>

        <Card accent="teal">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{format(selectedMonth, "MMMM yyyy")}</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setSelectedMonth(prevMonth)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Input
                  type="month"
                  value={format(selectedMonth, "yyyy-MM")}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedMonth(new Date(e.target.value + "-01"))}
                  className="w-40"
                />
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setSelectedMonth(nextMonth)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
                {calendarDays.map((date: Date) => {
                  const leaves = getLeaveForDay(date)
                  const isCurrentMonth = isSameMonth(date, selectedMonth)
                  const isToday = isSameDay(date, new Date())

                  return (
                    <div
                      key={date.toISOString()}
                      className={`
                        min-h-24 p-1 border rounded-lg
                        ${isCurrentMonth ? "bg-card" : "bg-muted/30"}
                        ${isToday ? "ring-2 ring-primary" : ""}
                      `}
                    >
                      <div className={`text-sm font-medium ${isCurrentMonth ? "" : "text-muted-foreground"}`}>
                        {format(date, "d")}
                      </div>
                      <div className="mt-1 space-y-1">
                        {leaves.slice(0, 2).map((leave) => (
                          <div
                            key={leave.id}
                            className={`
                              text-xs px-1 py-0.5 rounded truncate
                              ${getLeaveTypeColor(leave.leaveTypeId)} text-white
                            `}
                            title={`${leave.employeeName} - ${leave.leaveTypeName}`}
                          >
                            {leave.employeeName}
                          </div>
                        ))}
                        {leaves.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{leaves.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  )
}
