"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table"

interface HiringStatus {
  jobTitle: string
  jobId: string
  applied: number
  screening: number
  interview: number
  offer: number
  hired: number
  rejected: number
}

export default function HiringStatusPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const user = session?.user
  const [data, setData] = useState<HiringStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([{ id: "hired", desc: true }])

  const columnHelper = createColumnHelper<HiringStatus>()

  const columns = [
    columnHelper.accessor("jobTitle", {
      header: "Job Opening",
    }),
    columnHelper.accessor("applied", {
      header: "Applied",
      cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("screening", {
      header: "Screening",
      cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("interview", {
      header: "Interview",
      cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("offer", {
      header: "Offer",
      cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("hired", {
      header: "Hired",
      cell: (info) => <span className="font-mono text-sm font-medium text-chart-5">{info.getValue()}</span>,
    }),
    columnHelper.accessor("rejected", {
      header: "Rejected",
      cell: (info) => <span className="font-mono text-sm text-muted-foreground">{info.getValue()}</span>,
    }),
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
  })

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (user) { fetchHiringStatus() }
  }, [status, user])

  const fetchHiringStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/recruitment/hiring-status")
      const data = await response.json()
      setData(data)
    } catch (error) {
      console.error("Failed to fetch hiring status:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
      <div className="space-y-6 p-8">
        <div>
          <h1 className="font-heading text-2xl font-bold">Hiring Status</h1>
          <p className="text-muted-foreground">Applicant pipeline overview by job opening</p>
        </div>

        <Card accent="teal">
          <CardHeader>
            <CardTitle>Hiring Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : data.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">No hiring data found</div>
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
