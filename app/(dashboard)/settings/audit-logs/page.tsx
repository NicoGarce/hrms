"use client"

import { useState, useEffect } from "react"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AlertTriangle } from "lucide-react"

export default function AuditLogsPage() {
  const [user, setUser] = useState<any>(null)

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
    })
  }, [])

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
          <h1 className="font-heading text-2xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">View system audit trail</p>
        </div>

        <Card accent="slate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Audit Logs Gap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                The audit_logs table exists in the schema, but no Server Actions across the application currently write to it.
              </p>
              <p className="text-muted-foreground">
                To enable audit logging, a shared <code className="bg-muted px-1 py-0.5 rounded">logAudit()</code> helper function needs to be added to <code className="bg-muted px-1 py-0.5 rounded">lib/audit.ts</code> and called from existing Server Actions (employee CRUD, attendance updates, leave approvals, etc.).
              </p>
              <p className="text-muted-foreground">
                Once implemented, this page will display a filterable table of audit entries with user, action, resource, timestamp, and IP address.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
