"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
} from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users,
} from "lucide-react"

interface EmployeeRow {
  id: string
  employeeCode: string
  firstName: string
  lastName: string
  department: string | null
  position: string | null
  status: string
  hireDate: Date
}

interface EmployeesTableProps {
  employees: EmployeeRow[]
}

const statusStyles: Record<string, { bg: string; color: string }> = {
  ACTIVE: {
    bg: "color-mix(in oklch, var(--chart-3), transparent 85%)",
    color: "var(--chart-3)",
  },
  ON_LEAVE: {
    bg: "color-mix(in oklch, var(--chart-2), transparent 85%)",
    color: "var(--chart-2)",
  },
  TERMINATED: {
    bg: "color-mix(in oklch, var(--chart-4), transparent 85%)",
    color: "var(--chart-4)",
  },
  PROBATION: {
    bg: "color-mix(in oklch, var(--chart-1), transparent 85%)",
    color: "var(--chart-1)",
  },
}

export function EmployeesTable({ employees }: EmployeesTableProps) {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const columnHelper = createColumnHelper<EmployeeRow>()

  const columns = useMemo(
    () => [
      columnHelper.accessor("employeeCode", {
        header: "ID",
        cell: (info) => (
          <span className="font-mono text-xs text-muted-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor(
        (row) => `${row.lastName}, ${row.firstName}`,
        {
          id: "name",
          header: "Name",
        }
      ),
      columnHelper.accessor("department", {
        header: "Department",
        cell: (info) => info.getValue() ?? <span className="text-muted-foreground">-</span>,
      }),
      columnHelper.accessor("position", {
        header: "Position",
        cell: (info) => info.getValue() ?? <span className="text-muted-foreground">-</span>,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue()
          const style = statusStyles[status] ?? {
            bg: "color-mix(in oklch, var(--muted), transparent 50%)",
            color: "var(--muted-foreground)",
          }
          return (
            <Badge
              variant="outline"
              className="font-medium border-0"
              style={{ backgroundColor: style.bg, color: style.color }}
            >
              {status.replace(/_/g, " ")}
            </Badge>
          )
        },
      }),
      columnHelper.accessor("hireDate", {
        header: "Hire Date",
        cell: (info) => (
          <span className="font-mono text-xs">
            {new Date(info.getValue()).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        ),
      }),
    ],
    [columnHelper]
  )

  const table = useReactTable({
    data: employees,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: "includesString",
  })

  const pageCount = table.getPageCount()
  const currentPage = pagination.pageIndex

  const getPageNumbers = () => {
    if (pageCount <= 5) {
      return Array.from({ length: pageCount }, (_, i) => i)
    }
    const pages: (number | "...")[] = [0]
    if (currentPage > 2) pages.push("...")
    for (
      let i = Math.max(1, currentPage - 1);
      i <= Math.min(pageCount - 2, currentPage + 1);
      i++
    ) {
      if (i > 0 && i < pageCount - 1) pages.push(i)
    }
    if (currentPage < pageCount - 3) pages.push("...")
    if (pageCount > 1) pages.push(pageCount - 1)
    return pages
  }

  const noResults = table.getRowModel().rows.length === 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>All Employees</CardTitle>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={globalFilter ?? ""}
              onChange={(e) => {
                setGlobalFilter(e.target.value)
                setPagination((prev) => ({ ...prev, pageIndex: 0 }))
              }}
              className="pl-8 w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {noResults ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-heading text-lg font-medium">
              {employees.length === 0 ? "No employees yet" : "No matching results"}
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              {employees.length === 0
                ? "Get started by adding your first employee"
                : "Try a different search term"}
            </p>
            {employees.length === 0 && (
              <Link
                href="/employees/new"
                className={cn(buttonVariants({ variant: "default" }), "mt-4")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="h-10 px-3 text-left font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="flex items-center gap-1">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getCanSort() &&
                              (header.column.getIsSorted() === "asc" ? (
                                <ArrowUp className="h-3.5 w-3.5" />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ArrowDown className="h-3.5 w-3.5" />
                              ) : (
                                <ArrowUpDown className="h-3.5 w-3.5 opacity-30" />
                              ))}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-border cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => router.push(`/employees/${row.original.id}`)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-3 py-3">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Rows per page:
                <select
                  className="bg-transparent border border-border rounded-md px-2 py-1 text-sm"
                  value={pagination.pageSize}
                  onChange={(e) =>
                    setPagination({
                      pageIndex: 0,
                      pageSize: Number(e.target.value),
                    })
                  }
                >
                  {[10, 25, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <span>
                  {pagination.pageIndex * pagination.pageSize + 1}–
                  {Math.min(
                    (pagination.pageIndex + 1) * pagination.pageSize,
                    table.getFilteredRowModel().rows.length
                  )}{" "}
                  of {table.getFilteredRowModel().rows.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {getPageNumbers().map((page, idx) =>
                  page === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "ghost"}
                      size="icon-xs"
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, pageIndex: page }))
                      }
                      className="text-xs"
                    >
                      {page + 1}
                    </Button>
                  )
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
