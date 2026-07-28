"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, startOfDay, endOfDay, differenceInMinutes } from "date-fns"
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
  PaginationState,
} from "@tanstack/react-table"

interface TimeLog {
  id: string
  employeeCode: string
  firstName: string
  lastName: string
  departmentName: string | null
  date: string
  checkIn: string | null
  checkOut: string | null
  duration: string | null
}

export default function TimeLogsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<TimeLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [employeeFilter, setEmployeeFilter] = useState("")
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })

  const columnHelper = createColumnHelper<TimeLog>()

  const columns = [
    columnHelper.accessor("employeeCode", {
      header: "Employee Code",
      cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("firstName", {
      header: "First Name",
    }),
    columnHelper.accessor("lastName", {
      header: "Last Name",
    }),
    columnHelper.accessor("departmentName", {
      header: "Department",
      cell: (info) => info.getValue() || "—",
    }),
    columnHelper.accessor("date", {
      header: "Date",
      cell: (info) => <span className="font-mono text-sm">{format(new Date(info.getValue()), "yyyy-MM-dd")}</span>,
    }),
    columnHelper.accessor("checkIn", {
      header: "Check In",
      cell: (info) => {
        const value = info.getValue()
        return value ? <span className="font-mono text-sm">{format(new Date(value), "HH:mm:ss")}</span> : "—"
      },
    }),
    columnHelper.accessor("checkOut", {
      header: "Check Out",
      cell: (info) => {
        const value = info.getValue()
        return value ? <span className="font-mono text-sm">{format(new Date(value), "HH:mm:ss")}</span> : "—"
      },
    }),
    columnHelper.accessor("duration", {
      header: "Duration",
      cell: (info) => info.getValue() ? <span className="font-mono text-sm">{info.getValue()}</span> : "—",
    }),
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { pagination },
    onPaginationChange: setPagination,
  })

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (session?.user) {
      if (session.user.role === "DEPARTMENT_HEAD") {
        fetch(`/api/employee/by-email?email=${session.user.email}`)
          .then(res => res.json())
          .then(emp => {
            fetchTimeLogs(session.user.role, emp.departmentId)
          })
      } else {
        fetchTimeLogs(session.user.role, null)
      }
    }
  }, [status, session, selectedDate, employeeFilter])

  const fetchTimeLogs = async (role: string, departmentId: string | null) => {
    setLoading(true)
    const dateStart = startOfDay(selectedDate)
    const dateEnd = endOfDay(selectedDate)

    try {
      const response = await fetch(
        `/api/attendance/time-logs?dateStart=${dateStart.toISOString()}&dateEnd=${dateEnd.toISOString()}&role=${role}&departmentId=${departmentId || ""}&employeeFilter=${employeeFilter}`
      )
      const data = await response.json()
      setData(data)
    } catch (error) {
      console.error("Failed to fetch time logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const prevDay = new Date(selectedDate)
  prevDay.setDate(prevDay.getDate() - 1)
  const nextDay = new Date(selectedDate)
  nextDay.setDate(nextDay.getDate() + 1)

  if (status === "loading") return null

  return (
      <div className="space-y-6 p-8">
        <div>
          <h1 className="font-heading text-2xl font-bold">Time Logs</h1>
          <p className="text-muted-foreground">View employee clock-in and clock-out records</p>
        </div>

        <Card accent="teal">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Time Logs for {format(selectedDate, "MMMM d, yyyy")}</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setSelectedDate(prevDay)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Input
                  type="date"
                  value={format(selectedDate, "yyyy-MM-dd")}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="w-40"
                />
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setSelectedDate(nextDay)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Filter by employee..."
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : data.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">No time logs for this date</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id} className="border-b">
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table
                      .getRowModel()
                      .rows.slice(pagination.pageIndex * pagination.pageSize, (pagination.pageIndex + 1) * pagination.pageSize)
                      .map((row) => (
                        <tr key={row.id} className="border-b hover:bg-muted/50">
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-4 py-3 text-sm">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {pagination.pageIndex * pagination.pageSize + 1} to {Math.min((pagination.pageIndex + 1) * pagination.pageSize, data.length)} of {data.length} entries
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination({ ...pagination, pageIndex: pagination.pageIndex - 1 })}
                      disabled={pagination.pageIndex === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination({ ...pagination, pageIndex: pagination.pageIndex + 1 })}
                      disabled={(pagination.pageIndex + 1) * pagination.pageSize >= data.length}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  )
}
