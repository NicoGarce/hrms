"use client"

import { useState, useEffect } from "react"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Shield, ShieldCheck, ShieldAlert } from "lucide-react"
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table"

interface User {
  id: string
  email: string
  role: string
  employeeName: string | null
  deletedAt: string | null
}

export default function UsersPage() {
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const columnHelper = createColumnHelper<User>()

  const columns = [
    columnHelper.accessor("email", {
      header: "Email",
    }),
    columnHelper.accessor("employeeName", {
      header: "Employee",
      cell: (info) => info.getValue() || "—",
    }),
    columnHelper.accessor("role", {
      header: "Role",
      cell: (info) => {
        const role = info.getValue()
        const roleIcons = {
          SUPER_ADMINISTRATOR: <ShieldAlert className="h-4 w-4" />,
          HR_ADMINISTRATOR: <ShieldCheck className="h-4 w-4" />,
          DEPARTMENT_HEAD: <Shield className="h-4 w-4" />,
          EMPLOYEE: <Users className="h-4 w-4" />,
        }
        return (
          <div className="flex items-center gap-2">
            {roleIcons[role as keyof typeof roleIcons]}
            <span className="text-xs">{role}</span>
          </div>
        )
      },
    }),
    columnHelper.accessor("deletedAt", {
      header: "Status",
      cell: (info) => {
        const deleted = info.getValue()
        return deleted ? (
          <Badge className="bg-slate text-slate-foreground">Inactive</Badge>
        ) : (
          <Badge className="bg-chart-3 text-chart-3-foreground">Active</Badge>
        )
      },
    }),
  ]

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  useEffect(() => {
    auth().then((session) => {
      if (!session?.user) {
        window.location.href = "/login"
        return
      }
      setUser(session.user)
      if (session.user.role !== "SUPER_ADMINISTRATOR") {
        window.location.href = "/dashboard"
        return
      }
      fetchUsers()
    })
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/settings/users")
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  if (user.role !== "SUPER_ADMINISTRATOR") {
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
        <div>
          <h1 className="font-heading text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage system users and roles</p>
        </div>

        <Card accent="slate">
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : users.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">No users found</div>
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
