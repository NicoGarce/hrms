"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Download } from "lucide-react"
import { format, startOfMonth, endOfMonth, getDaysInMonth } from "date-fns"
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table"

interface EmployeeAttendance {
  id: string
  employeeCode: string
  firstName: string
  lastName: string
  departmentName: string | null
  presentDays: number
  totalDays: number
  percentage: number
}

export default function MonthlyReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [data, setData] = useState<EmployeeAttendance[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([{ id: "percentage", desc: true }])

  const columnHelper = createColumnHelper<EmployeeAttendance>()

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
    columnHelper.accessor("presentDays", {
      header: "Present Days",
      cell: (info) => <span className="font-mono">{info.getValue()}</span>,
    }),
    columnHelper.accessor("totalDays", {
      header: "Total Days",
      cell: (info) => <span className="font-mono">{info.getValue()}</span>,
    }),
    columnHelper.accessor("percentage", {
      header: "Attendance %",
      cell: (info) => {
        const value = info.getValue()
        return (
          <Badge
            variant={value >= 80 ? "default" : value >= 60 ? "secondary" : "destructive"}
            className="font-mono"
          >
            {value.toFixed(1)}%
          </Badge>
        )
      },
    }),
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  })

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (session?.user) {
      if (session.user.role === "DEPARTMENT_HEAD") {
        fetch(`/api/employee/by-email?email=${session.user.email}`)
          .then(res => res.json())
          .then(emp => {
            fetchAttendance(session.user.role, emp.departmentId)
          })
      } else {
        fetchAttendance(session.user.role, null)
      }
    }
  }, [status, session, selectedMonth])

  const fetchAttendance = async (role: string, departmentId: string | null) => {
    setLoading(true)
    const monthStart = startOfMonth(selectedMonth)
    const monthEnd = endOfMonth(selectedMonth)
    const totalDays = getDaysInMonth(selectedMonth)

    try {
      const response = await fetch(
        `/api/attendance/reports?monthStart=${monthStart.toISOString()}&monthEnd=${monthEnd.toISOString()}&role=${role}&departmentId=${departmentId || ""}`
      )
      const data = await response.json()
      
      const processed = data.map((emp: any) => ({
        ...emp,
        totalDays,
        percentage: totalDays > 0 ? (emp.presentDays / totalDays) * 100 : 0,
      }))
      
      setData(processed)
    } catch (error) {
      console.error("Failed to fetch attendance reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = () => {
    const headers = ["Employee Code", "First Name", "Last Name", "Department", "Present Days", "Total Days", "Attendance %"]
    const rows = data.map((emp) => [
      emp.employeeCode,
      emp.firstName,
      emp.lastName,
      emp.departmentName || "",
      emp.presentDays,
      emp.totalDays,
      emp.percentage.toFixed(1) + "%",
    ])
    
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance-report-${format(selectedMonth, "yyyy-MM")}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const prevMonth = new Date(selectedMonth)
  prevMonth.setMonth(prevMonth.getMonth() - 1)
  const nextMonth = new Date(selectedMonth)
  nextMonth.setMonth(nextMonth.getMonth() + 1)

  if (status === "loading") return null

  return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Monthly Attendance Reports</h1>
            <p className="text-muted-foreground">View attendance statistics by month</p>
          </div>
          <Button onClick={exportCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
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
                  onChange={(e) => setSelectedMonth(new Date(e.target.value + "-01"))}
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
            ) : data.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">No attendance data for this period</div>
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
                            className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:bg-muted/50"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() === "asc" && " ↑"}
                            {header.column.getIsSorted() === "desc" && " ↓"}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map((row) => (
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  )
}
