"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Plus, Star, Check } from "lucide-react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const reviewSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  reviewPeriod: z.string().min(1, "Review period is required"),
  rating: z.number().min(1).max(5),
  goals: z.string().optional(),
  kpis: z.string().optional(),
  feedback: z.string().min(1, "Feedback is required"),
  isDraft: z.boolean(),
})

type ReviewFormData = z.infer<typeof reviewSchema>

interface PerformanceReview {
  id: string
  employeeName: string
  reviewerName: string
  reviewPeriod: string
  rating: number | null
  status: string
  createdAt: string
}

export default function PerformancePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const user = session?.user
  const [reviews, setReviews] = useState<PerformanceReview[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([])
  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      employeeId: "",
      reviewPeriod: "",
      rating: 3,
      goals: "",
      kpis: "",
      feedback: "",
      isDraft: true,
    },
  })

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (user) { fetchReviews(); fetchEmployees() }
  }, [status, user])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/performance/reviews")
      const data = await response.json()
      setReviews(data)
    } catch (error) {
      console.error("Failed to fetch reviews:", error)
      toast.error("Failed to load reviews")
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees")
      const data = await response.json()
      setEmployees(data.map((e: any) => ({ id: e.id, name: `${e.firstName} ${e.lastName}` })))
    } catch (error) {
      console.error("Failed to fetch employees:", error)
    }
  }

  const onSubmit = async (data: ReviewFormData) => {
    try {
      const response = await fetch("/api/performance/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success(data.isDraft ? "Review saved as draft" : "Review submitted")
        setSheetOpen(false)
        form.reset()
        fetchReviews()
      } else {
        toast.error("Failed to save review")
      }
    } catch (error) {
      console.error("Failed to save review:", error)
      toast.error("Failed to save review")
    }
  }

  const acknowledgeReview = async (id: string) => {
    try {
      const response = await fetch(`/api/performance/reviews/${id}/acknowledge`, { method: "POST" })
      if (response.ok) {
        toast.success("Review acknowledged")
        fetchReviews()
      } else {
        toast.error("Failed to acknowledge review")
      }
    } catch (error) {
      console.error("Failed to acknowledge review:", error)
      toast.error("Failed to acknowledge review")
    }
  }

  const statusColors = {
    DRAFT: "bg-slate text-slate-foreground",
    SUBMITTED: "bg-chart-2 text-chart-2-foreground",
    REVIEWED: "bg-chart-3 text-chart-3-foreground",
    APPROVED: "bg-chart-5 text-chart-5-foreground",
  }

  if (!user) return null

  return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Performance Reviews</h1>
            <p className="text-muted-foreground">Manage employee performance evaluations</p>
          </div>
          {(user?.role === "SUPER_ADMINISTRATOR" || user?.role === "HR_ADMINISTRATOR" || user?.role === "DEPARTMENT_HEAD") && (
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger
                render={<Button className="gap-2"><Plus className="h-4 w-4" />New Review</Button>}
                onClick={() => form.reset()}
              />
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>New Performance Review</SheetTitle>
                </SheetHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Employee</label>
                    <select
                      {...form.register("employeeId")}
                      className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
                    >
                      <option value="">Select employee</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                    {form.formState.errors.employeeId && (
                      <p className="text-xs text-destructive">{form.formState.errors.employeeId.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Review Period</label>
                    <Input {...form.register("reviewPeriod")} placeholder="e.g., Q1 2024" />
                    {form.formState.errors.reviewPeriod && (
                      <p className="text-xs text-destructive">{form.formState.errors.reviewPeriod.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rating (1-5)</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => form.setValue("rating", rating)}
                          className={`p-2 rounded ${form.watch("rating") >= rating ? "text-chart-4" : "text-muted-foreground"}`}
                        >
                          <Star className={`h-5 w-5 ${form.watch("rating") >= rating ? "fill-current" : ""}`} />
                        </button>
                      ))}
                    </div>
                    {form.formState.errors.rating && (
                      <p className="text-xs text-destructive">{form.formState.errors.rating.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Goals</label>
                    <textarea
                      {...form.register("goals")}
                      className="w-full min-h-20 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
                      placeholder="Employee goals for this period"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">KPIs</label>
                    <textarea
                      {...form.register("kpis")}
                      className="w-full min-h-20 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
                      placeholder="Key performance indicators"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Feedback</label>
                    <textarea
                      {...form.register("feedback")}
                      className="w-full min-h-24 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
                      placeholder="Detailed feedback"
                    />
                    {form.formState.errors.feedback && (
                      <p className="text-xs text-destructive">{form.formState.errors.feedback.message}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => form.handleSubmit((data) => onSubmit({ ...data, isDraft: true }))()}
                    >
                      Save Draft
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      onClick={() => form.setValue("isDraft", false)}
                    >
                      Submit
                    </Button>
                  </div>
                </form>
              </SheetContent>
            </Sheet>
          )}
        </div>

        <Card accent="teal">
          <CardHeader>
            <CardTitle>All Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">No reviews found</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Employee</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Reviewer</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Period</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Rating</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((review) => (
                      <tr key={review.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">{review.employeeName}</td>
                        <td className="px-4 py-3">{review.reviewerName}</td>
                        <td className="px-4 py-3">{review.reviewPeriod}</td>
                        <td className="px-4 py-3">
                          {review.rating ? (
                            <span className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-chart-4 text-chart-4" />
                              {review.rating}/5
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={statusColors[review.status as keyof typeof statusColors] || ""}>
                            {review.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {review.status === "SUBMITTED" && user?.role === "EMPLOYEE" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => acknowledgeReview(review.id)}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Acknowledge
                            </Button>
                          )}
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
