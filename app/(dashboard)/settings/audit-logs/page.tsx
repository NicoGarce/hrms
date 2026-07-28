"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Download, Search, RefreshCw } from "lucide-react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  SortingState,
} from "@tanstack/react-table"

interface AuditEntry {
  id: string
  userId: string | null
  userEmail: string | null
  action: string
  resource: string
  resourceId: string | null
  details: Record<string, unknown> | null
  ipAddress: string | null
  createdAt: string
}

export default function AuditLogsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }])

  const columnHelper = createColumnHelper<AuditEntry>()

  const columns = [
    columnHelper.accessor("createdAt", {
      header: "Timestamp",
      cell: (info) => new Date(info.getValue()).toLocaleString(),
    }),
    columnHelper.accessor("userEmail", {
      header: "User",
      cell: (info) => info.getValue() || "System",
    }),
    columnHelper.accessor("action", {
      header: "Action",
      cell: (info) => (
        <Badge variant="outline">{info.getValue()}</Badge>
      ),
    }),
    columnHelper.accessor("resource", {
      header: "Resource",
    }),
    columnHelper.accessor("resourceId", {
      header: "Resource ID",
      cell: (info) => info.getValue() ? (
        <code className="text-xs bg-muted px-1 py-0.5 rounded">{info.getValue()}</code>
      ) : "—",
    }),
    columnHelper.accessor("ipAddress", {
      header: "IP Address",
      cell: (info) => info.getValue() || "—",
    }),
  ]

  const table = useReactTable({
    data: logs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
  })

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (status === "authenticated" && session?.user) {
      if (session.user.role !== "SUPER_ADMINISTRATOR") {
        router.push("/dashboard")
        return
      }
      fetchLogs()
    }
  }, [status, session, router])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/settings/audit-logs?search=${search}`)
      const data = await response.json()
      setLogs(data)
    } catch (error) {
      console.error("Failed to fetch audit logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    const headers = ["Timestamp", "User", "Action", "Resource", "Resource ID", "IP Address"]
    const rows = logs.map((l) => [
      new Date(l.createdAt).toISOString(),
      l.userEmail || "System",
      l.action,
      l.resource,
      l.resourceId || "",
      l.ipAddress || "",
    ])
    const csvContent = [headers, ...rows].map((r) => r.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "audit-logs.csv"
    a.click()
  }

  if (status === "loading") return null

  if (session?.user?.role !== "SUPER_ADMINISTRATOR") {
    return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Access restricted to SUPER_ADMINISTRATOR</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">View system audit trail</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV} disabled={logs.length === 0}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card accent="slate">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Audit Trail
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-48 pl-8 h-8"
                  onKeyDown={(e) => e.key === "Enter" && fetchLogs()}
                />
              </div>
              <Button variant="secondary" size="sm" onClick={fetchLogs} disabled={loading}>
                Search
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading audit logs...</div>
            </div>
          ) : logs.length === 0 ? (
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">No audit logs found</div>
              </div>
              <div className="border-t pt-4">
                <p className="text-muted-foreground">
                  Audit logging is active. Entries will appear here as users perform actions in the system.
                </p>
              </div>
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
                          <div className="flex items-center gap-1">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() === "asc" && " ↑"}
                            {header.column.getIsSorted() === "desc" && " ↓"}
                          </div>
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
