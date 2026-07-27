"use client"

import { useState, useEffect } from "react"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Plus, Pencil, Trash2, Users } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface JobOpening {
  id: string
  title: string
  departmentName: string | null
  status: string
  applicantCount: number
  postedAt: string
}

export default function RecruitmentPage() {
  const [user, setUser] = useState<any>(null)
  const [jobs, setJobs] = useState<JobOpening[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<JobOpening | null>(null)
  const [formData, setFormData] = useState({ title: "", departmentId: "", description: "", requirements: "", status: "OPEN" })
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const router = useRouter()

  useEffect(() => {
    auth().then((session) => {
      if (!session?.user) {
        window.location.href = "/login"
        return
      }
      setUser(session.user)
      fetchJobs()
      fetchDepartments()
    })
  }, [])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/recruitment/jobs")
      const data = await response.json()
      setJobs(data)
    } catch (error) {
      console.error("Failed to fetch jobs:", error)
      toast.error("Failed to load job openings")
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments")
      const data = await response.json()
      setDepartments(data)
    } catch (error) {
      console.error("Failed to fetch departments:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editingJob ? `/api/recruitment/jobs/${editingJob.id}` : "/api/recruitment/jobs"
    const method = editingJob ? "PUT" : "POST"

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(editingJob ? "Job opening updated" : "Job opening created")
        setSheetOpen(false)
        setEditingJob(null)
        setFormData({ title: "", departmentId: "", description: "", requirements: "", status: "OPEN" })
        fetchJobs()
      } else {
        toast.error("Failed to save job opening")
      }
    } catch (error) {
      console.error("Failed to save job opening:", error)
      toast.error("Failed to save job opening")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job opening?")) return

    try {
      const response = await fetch(`/api/recruitment/jobs/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast.success("Job opening deleted")
        fetchJobs()
      } else {
        toast.error("Failed to delete job opening")
      }
    } catch (error) {
      console.error("Failed to delete job opening:", error)
      toast.error("Failed to delete job opening")
    }
  }

  const openEditSheet = (job: JobOpening) => {
    setEditingJob(job)
    setFormData({
      title: job.title,
      departmentId: "",
      description: "",
      requirements: "",
      status: job.status,
    })
    setSheetOpen(true)
  }

  const openNewSheet = () => {
    setEditingJob(null)
    setFormData({ title: "", departmentId: "", description: "", requirements: "", status: "OPEN" })
    setSheetOpen(true)
  }

  const statusColors = {
    DRAFT: "bg-slate text-slate-foreground",
    OPEN: "bg-chart-3 text-chart-3-foreground",
    CLOSED: "bg-chart-4 text-chart-4-foreground",
  }

  if (!user) return null

  return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Job Openings</h1>
            <p className="text-muted-foreground">Manage recruitment job postings</p>
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              render={<Button className="gap-2"><Plus className="h-4 w-4" />Add Job Opening</Button>}
              onClick={openNewSheet}
            />
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{editingJob ? "Edit Job Opening" : "Add Job Opening"}</SheetTitle>
              </SheetHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
                    required
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full min-h-24 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Requirements</label>
                  <textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    className="w-full min-h-24 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="OPEN">Open</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
                <Button type="submit" className="w-full">
                  {editingJob ? "Update" : "Create"} Job Opening
                </Button>
              </form>
            </SheetContent>
          </Sheet>
        </div>

        <Card accent="teal">
          <CardHeader>
            <CardTitle>All Job Openings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">No job openings found</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Title</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Department</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Applicants</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Posted</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr
                        key={job.id}
                        className="border-b hover:bg-muted/50 cursor-pointer"
                        onClick={() => router.push(`/recruitment/applicants?job=${job.id}`)}
                      >
                        <td className="px-4 py-3 font-medium">{job.title}</td>
                        <td className="px-4 py-3">{job.departmentName || "—"}</td>
                        <td className="px-4 py-3">
                          <Badge className={statusColors[job.status as keyof typeof statusColors] || ""}>
                            {job.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {job.applicantCount}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(job.postedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openEditSheet(job)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive"
                              onClick={() => handleDelete(job.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
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
