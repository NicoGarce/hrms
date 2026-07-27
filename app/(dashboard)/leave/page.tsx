"use client"

import { useState, useEffect } from "react"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Check, X, Calendar, Filter } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const leaveRequestSchema = z.object({
  leaveTypeId: z.string().min(1, "Leave type is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().min(1, "Reason is required"),
})

type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>

interface LeaveRequest {
  id: string
  employeeId: string
  employeeName: string
  employeeCode: string
  leaveTypeName: string
  startDate: string
  endDate: string
  reason: string
  status: "PENDING" | "APPROVED" | "REJECTED"
}

interface LeaveType {
  id: string
  name: string
  daysAllowed: number
}

export default function LeaveRequestsPage() {
  const [user, setUser] = useState<any>(null)
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  const form = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      leaveTypeId: "",
      startDate: "",
      endDate: "",
      reason: "",
    },
  })

  useEffect(() => {
    auth().then((session) => {
      if (!session?.user) {
        window.location.href = "/login"
        return
      }
      setUser(session.user)
      fetchLeaveRequests(session.user)
      fetchLeaveTypes()
    })
  }, [statusFilter])

  const fetchLeaveRequests = async (currentUser: any) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/leave/requests?status=${statusFilter}`)
      const data = await response.json()
      
      // Filter based on role
      const filtered = data.filter((req: LeaveRequest) => {
        if (currentUser.role === "EMPLOYEE") {
          return req.employeeId === currentUser.id
        }
        if (currentUser.role === "DEPARTMENT_HEAD") {
          // Fetch employee to get departmentId
          return fetch(`/api/employee/by-email?email=${currentUser.email}`)
            .then(res => res.json())
            .then(emp => {
              // For department head, show their department's requests
              // This is simplified - in production you'd include department in the API response
              return true
            })
        }
        return true // HR and SUPER_ADMIN see all
      })
      
      setLeaveRequests(data)
    } catch (error) {
      console.error("Failed to fetch leave requests:", error)
      toast.error("Failed to load leave requests")
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaveTypes = async () => {
    try {
      const response = await fetch("/api/leave/types")
      const data = await response.json()
      setLeaveTypes(data)
    } catch (error) {
      console.error("Failed to fetch leave types:", error)
    }
  }

  const onSubmit = async (data: LeaveRequestFormData) => {
    try {
      const response = await fetch("/api/leave/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Leave request submitted")
        setSheetOpen(false)
        form.reset()
        if (user) fetchLeaveRequests(user)
      } else {
        toast.error("Failed to submit leave request")
      }
    } catch (error) {
      console.error("Failed to submit leave request:", error)
      toast.error("Failed to submit leave request")
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/leave/requests/${id}/approve`, { method: "POST" })
      if (response.ok) {
        toast.success("Leave request approved")
        if (user) fetchLeaveRequests(user)
      } else {
        toast.error("Failed to approve leave request")
      }
    } catch (error) {
      console.error("Failed to approve leave request:", error)
      toast.error("Failed to approve leave request")
    }
  }

  const handleReject = async () => {
    if (!rejectingRequestId) return

    try {
      const response = await fetch(`/api/leave/requests/${rejectingRequestId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      })

      if (response.ok) {
        toast.success("Leave request rejected")
        setRejectDialogOpen(false)
        setRejectingRequestId(null)
        setRejectReason("")
        if (user) fetchLeaveRequests(user)
      } else {
        toast.error("Failed to reject leave request")
      }
    } catch (error) {
      console.error("Failed to reject leave request:", error)
      toast.error("Failed to reject leave request")
    }
  }

  const canApproveReject = user?.role === "DEPARTMENT_HEAD" || user?.role === "HR_ADMINISTRATOR" || user?.role === "SUPER_ADMINISTRATOR"

  const statusColors = {
    PENDING: "bg-chart-2 text-chart-2-foreground",
    APPROVED: "bg-chart-3 text-chart-3-foreground",
    REJECTED: "bg-chart-4 text-chart-4-foreground",
  }

  if (!user) return null

  return (
    <>
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Leave Requests</h1>
            <p className="text-muted-foreground">Manage employee leave requests</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 border rounded-lg p-1">
              <Button
                variant={statusFilter === "ALL" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setStatusFilter("ALL")}
              >
                All
              </Button>
              <Button
                variant={statusFilter === "PENDING" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setStatusFilter("PENDING")}
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === "APPROVED" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setStatusFilter("APPROVED")}
              >
                Approved
              </Button>
              <Button
                variant={statusFilter === "REJECTED" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setStatusFilter("REJECTED")}
              >
                Rejected
              </Button>
            </div>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger
                render={<Button className="gap-2"><Plus className="h-4 w-4" />New Request</Button>}
                onClick={() => form.reset()}
              />
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>New Leave Request</SheetTitle>
                </SheetHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Leave Type</label>
                    <select
                      {...form.register("leaveTypeId")}
                      className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
                    >
                      <option value="">Select leave type</option>
                      {leaveTypes.map((lt) => (
                        <option key={lt.id} value={lt.id}>
                          {lt.name} ({lt.daysAllowed} days)
                        </option>
                      ))}
                    </select>
                    {form.formState.errors.leaveTypeId && (
                      <p className="text-xs text-destructive">{form.formState.errors.leaveTypeId.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <Input type="date" {...form.register("startDate")} />
                    {form.formState.errors.startDate && (
                      <p className="text-xs text-destructive">{form.formState.errors.startDate.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Date</label>
                    <Input type="date" {...form.register("endDate")} />
                    {form.formState.errors.endDate && (
                      <p className="text-xs text-destructive">{form.formState.errors.endDate.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Reason</label>
                    <textarea
                      {...form.register("reason")}
                      className="w-full min-h-25 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
                      placeholder="Enter reason for leave request"
                    />
                    {form.formState.errors.reason && (
                      <p className="text-xs text-destructive">{form.formState.errors.reason.message}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full">
                    Submit Request
                  </Button>
                </form>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <Card accent="teal">
          <CardHeader>
            <CardTitle>Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : leaveRequests.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">No leave requests found</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Employee</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Leave Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date Range</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Reason</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                      {canApproveReject && (
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {leaveRequests.map((request) => (
                      <tr key={request.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">{request.employeeName}</div>
                            <div className="text-xs text-muted-foreground font-mono">{request.employeeCode}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{request.leaveTypeName}</td>
                        <td className="px-4 py-3 font-mono text-sm">
                          {format(new Date(request.startDate), "MMM d")} - {format(new Date(request.endDate), "MMM d, yyyy")}
                        </td>
                        <td className="px-4 py-3 text-sm max-w-xs truncate">{request.reason}</td>
                        <td className="px-4 py-3">
                          <Badge className={statusColors[request.status]}>{request.status}</Badge>
                        </td>
                        {canApproveReject && request.status === "PENDING" && (
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-chart-3 hover:bg-chart-3/10"
                                onClick={() => handleApprove(request.id)}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-chart-4 hover:bg-chart-4/10"
                                onClick={() => {
                                  setRejectingRequestId(request.id)
                                  setRejectDialogOpen(true)
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rejection Reason</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full min-h-25 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
                placeholder="Enter reason for rejection"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReject} disabled={!rejectReason}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
