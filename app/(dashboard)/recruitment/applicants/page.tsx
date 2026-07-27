"use client"

import { useState, useEffect } from "react"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { UserPlus, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table"

interface Applicant {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  jobTitle: string
  jobId: string
  status: string
  appliedAt: string
}

export default function ApplicantsPage() {
  const [user, setUser] = useState<any>(null)
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [stageFilter, setStageFilter] = useState<string>("ALL")
  const router = useRouter()
  const searchParams = useSearchParams()
  const jobId = searchParams.get("job") || ""

  const columnHelper = createColumnHelper<Applicant>()

  const columns = [
    columnHelper.accessor("firstName", {
      header: "Name",
      cell: (info) => (
        <div>
          <div className="font-medium">{info.row.original.firstName} {info.row.original.lastName}</div>
          <div className="text-xs text-muted-foreground">{info.row.original.email}</div>
        </div>
      ),
    }),
    columnHelper.accessor("jobTitle", {
      header: "Job",
    }),
    columnHelper.accessor("status", {
      header: "Stage",
      cell: (info) => {
        const status = info.getValue()
        const colors = {
          APPLIED: "bg-chart-1 text-chart-1-foreground",
          SCREENING: "bg-chart-2 text-chart-2-foreground",
          INTERVIEW: "bg-chart-3 text-chart-3-foreground",
          OFFER: "bg-chart-4 text-chart-4-foreground",
          HIRED: "bg-chart-5 text-chart-5-foreground",
          REJECTED: "bg-slate text-slate-foreground",
        }
        return <Badge className={colors[status as keyof typeof colors] || ""}>{status}</Badge>
      },
    }),
    columnHelper.accessor("appliedAt", {
      header: "Applied",
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.accessor("id", {
      header: "Actions",
      cell: (info) => {
        const applicant = info.row.original
        return (
          <div className="flex gap-2">
            <select
              value={applicant.status}
              onChange={(e) => updateStage(applicant.id, e.target.value)}
              className="h-7 rounded border border-input bg-transparent px-2 text-xs"
            >
              <option value="APPLIED">Applied</option>
              <option value="SCREENING">Screening</option>
              <option value="INTERVIEW">Interview</option>
              <option value="OFFER">Offer</option>
              <option value="HIRED">Hired</option>
              <option value="REJECTED">Rejected</option>
            </select>
            {applicant.status === "HIRED" && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => convertToEmployee(applicant)}
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Convert
              </Button>
            )}
          </div>
        )
      },
    }),
  ]

  const table = useReactTable({
    data: applicants,
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
      fetchApplicants()
    })
  }, [jobId, stageFilter])

  const fetchApplicants = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/recruitment/applicants?jobId=${jobId}&status=${stageFilter}`)
      const data = await response.json()
      setApplicants(data)
    } catch (error) {
      console.error("Failed to fetch applicants:", error)
      toast.error("Failed to load applicants")
    } finally {
      setLoading(false)
    }
  }

  const updateStage = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/recruitment/applicants/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast.success("Stage updated")
        fetchApplicants()
      } else {
        toast.error("Failed to update stage")
      }
    } catch (error) {
      console.error("Failed to update stage:", error)
      toast.error("Failed to update stage")
    }
  }

  const convertToEmployee = (applicant: Applicant) => {
    const params = new URLSearchParams({
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      email: applicant.email,
    })
    router.push(`/employees/new?${params.toString()}`)
  }

  if (!user) return null

  return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Applicants</h1>
            <p className="text-muted-foreground">Manage job applicants</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 border rounded-lg p-1">
              <Button
                variant={stageFilter === "ALL" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setStageFilter("ALL")}
              >
                All
              </Button>
              <Button
                variant={stageFilter === "APPLIED" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setStageFilter("APPLIED")}
              >
                Applied
              </Button>
              <Button
                variant={stageFilter === "SCREENING" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setStageFilter("SCREENING")}
              >
                Screening
              </Button>
              <Button
                variant={stageFilter === "INTERVIEW" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setStageFilter("INTERVIEW")}
              >
                Interview
              </Button>
              <Button
                variant={stageFilter === "OFFER" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setStageFilter("OFFER")}
              >
                Offer
              </Button>
              <Button
                variant={stageFilter === "HIRED" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setStageFilter("HIRED")}
              >
                Hired
              </Button>
              <Button
                variant={stageFilter === "REJECTED" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setStageFilter("REJECTED")}
              >
                Rejected
              </Button>
            </div>
            {jobId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/recruitment")}
              >
                <ArrowRight className="h-4 w-4 mr-1" />
                All Jobs
              </Button>
            )}
          </div>
        </div>

        <Card accent="teal">
          <CardHeader>
            <CardTitle>Applicants</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : applicants.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">No applicants found</div>
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
