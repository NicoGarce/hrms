"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { format, startOfMonth, endOfMonth } from "date-fns"
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table"

interface OvertimeRecord {
  id: string
  employeeCode: string
  firstName: string
  lastName: string
  departmentName: string | null
  date: string
  overtimeHours: number
}

export default function OvertimePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<OvertimeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date())

  const columnHelper = createColumnHelper<OvertimeRecord>()

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
      cell: (info) => <span className="font-mono text-sm">{format(new Date(info.getValue()), "MMM d, yyyy")}</span>,
    }),
    columnHelper.accessor("overtimeHours", {
      header: "Overtime Hours",
      cell: (info) => (
        <span className="font-mono text-sm font-medium text-chart-4">{info.getValue().toFixed(1)}h</span>
      ),
    }),
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (session?.user) {
      if (session.user.role === "DEPARTMENT_HEAD") {
        fetch(`/api/employee/by-email?email=${session.user.email}`)
          .then(res => res.json())
          .then(emp => {
            fetchOvertime(session.user.role, emp.departmentId)
          })
      } else {
        fetchOvertime(session.user.role, null)
      }
    }
  }, [status, session, selectedMonth])

  const fetchOvertime = async (role: string, departmentId: string | null) => {
    setLoading(true)
    const monthStart = startOfMonth(selectedMonth)
    const monthEnd = endOfMonth(selectedMonth)

    try {
      const response = await fetch(
        `/api/attendance/overtime?monthStart=${monthStart.toISOString()}&monthEnd=${monthEnd.toISOString()}&role=${role}&departmentId=${departmentId || ""}`
      )
      const data = await response.json()
      setData(data)
    } catch (error) {
      console.error("Failed to fetch overtime records:", error)
    } finally {
      setLoading(false)
    }
  }

  const prevMonth = new Date(selectedMonth)
  prevMonth.setMonth(prevMonth.getMonth() - 1)
  const nextMonth = new Date(selectedMonth)
  nextMonth.setMonth(nextMonth.getMonth() + 1)

  if (status === "loading") return null

  return (
      <div className="space-y-6 p-8">
        <div>
          <h1 className="font-heading text-2xl font-bold">Overtime</h1>
          <p className="text-muted-foreground">Employees exceeding standard working hours</p>
        </div>

        <Card accent="brick">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Overtime Records - {format(selectedMonth, "MMMM yyyy")}</CardTitle>
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
                <div className="text-muted-foreground">No overtime records for this period</div>
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
