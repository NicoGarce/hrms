"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Key } from "lucide-react"

interface RolePermission {
  roleName: string
  permissionName: string
  resource: string
  action: string
}

export default function RolesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [permissions, setPermissions] = useState<RolePermission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (status === "authenticated" && session?.user) {
      if (session.user.role !== "SUPER_ADMINISTRATOR") {
        router.push("/dashboard")
        return
      }
      fetchPermissions()
    }
  }, [status, session, router])

  const fetchPermissions = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/settings/roles")
      const data = await response.json()
      setPermissions(data)
    } catch (error) {
      console.error("Failed to fetch permissions:", error)
    } finally {
      setLoading(false)
    }
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
        <div>
          <h1 className="font-heading text-2xl font-bold">Roles & Permissions</h1>
          <p className="text-muted-foreground">View role-based access control configuration</p>
        </div>

        <Card accent="slate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-muted-foreground text-sm">Loading...</div>
            ) : permissions.length === 0 ? (
              <div className="text-muted-foreground text-sm">No permissions configured</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Role</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Resource</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Action</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Permission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((perm, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <Badge className="bg-chart-2 text-chart-2-foreground">{perm.roleName}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">{perm.resource}</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant="outline">{perm.action}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">{perm.permissionName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card accent="slate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              System Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge className="bg-chart-4 text-chart-4-foreground">SUPER_ADMINISTRATOR</Badge>
                <span className="text-muted-foreground">Full system access</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-chart-3 text-chart-3-foreground">HR_ADMINISTRATOR</Badge>
                <span className="text-muted-foreground">HR management access</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-chart-2 text-chart-2-foreground">DEPARTMENT_HEAD</Badge>
                <span className="text-muted-foreground">Department-level access</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-slate text-slate-foreground">EMPLOYEE</Badge>
                <span className="text-muted-foreground">Self-service access</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
