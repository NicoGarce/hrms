import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Mail, Building2, Briefcase, Calendar, Phone, MapPin, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { format } from "date-fns"
import { EmployeeDocuments } from "./_components/EmployeeDocuments"

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) notFound()

  const { id } = await params

  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      profile: true,
      department: { select: { id: true, name: true, code: true } },
      position: { select: { id: true, title: true, level: true } },
      user: { select: { email: true } },
      documents: {
        select: { id: true, name: true, type: true, uploadedAt: true, fileUrl: true },
        orderBy: { uploadedAt: "desc" },
      },
    },
  })

  if (!employee || employee.deletedAt) notFound()

  const initials = `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase()
  const canEdit = ["SUPER_ADMINISTRATOR", "HR_ADMINISTRATOR", "DEPARTMENT_HEAD"].includes(session.user.role as string)

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-chart-3 text-chart-3-foreground",
    ON_LEAVE: "bg-chart-2 text-chart-2-foreground",
    TERMINATED: "bg-chart-4 text-chart-4-foreground",
    PROBATION: "bg-chart-1 text-chart-1-foreground",
  }

  return (
    <div className="space-y-6 p-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Employee Details</h1>
          <p className="text-muted-foreground">{employee.employeeCode}</p>
        </div>
        {canEdit && (
          <Link href={`/employees/${id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card accent="slate">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>
                <h2 className="font-heading text-lg font-bold">{employee.firstName} {employee.lastName}</h2>
                <p className="text-sm text-muted-foreground">{employee.position?.title || "No position"}</p>
                <Badge className={`mt-2 ${statusColors[employee.status] || ""}`}>
                  {employee.status.replace("_", " ")}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card accent="slate">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <AlertCircle className="h-4 w-4" />
                Quick Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground truncate">{employee.user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">{employee.department?.name || "—"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Hired {format(new Date(employee.hireDate), "MMM d, yyyy")}</span>
              </div>
              {employee.profile?.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{employee.profile.phone}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card accent="teal">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-muted-foreground">First Name</dt>
                  <dd className="text-sm font-medium">{employee.firstName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Last Name</dt>
                  <dd className="text-sm font-medium">{employee.lastName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Email</dt>
                  <dd className="text-sm font-medium">{employee.user.email}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Employee Code</dt>
                  <dd className="text-sm font-mono font-medium">{employee.employeeCode}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Department</dt>
                  <dd className="text-sm font-medium">{employee.department?.name || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Position</dt>
                  <dd className="text-sm font-medium">{employee.position?.title || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Level</dt>
                  <dd className="text-sm font-medium">{employee.position?.level || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Hire Date</dt>
                  <dd className="text-sm font-medium">{format(new Date(employee.hireDate), "MMM d, yyyy")}</dd>
                </div>
                {employee.profile?.dateOfBirth && (
                  <div>
                    <dt className="text-xs text-muted-foreground">Date of Birth</dt>
                    <dd className="text-sm font-medium">{format(new Date(employee.profile.dateOfBirth), "MMM d, yyyy")}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-muted-foreground">Status</dt>
                  <dd className="text-sm font-medium">{employee.status.replace("_", " ")}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {employee.profile?.address && (
            <Card accent="brass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4" />
                  Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{employee.profile.address}</p>
              </CardContent>
            </Card>
          )}

          {employee.profile?.emergencyContact && (
            <Card accent="brick">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <AlertCircle className="h-4 w-4" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{employee.profile.emergencyContact}</p>
              </CardContent>
            </Card>
          )}

          <EmployeeDocuments
            documents={employee.documents.map((d) => ({
              id: d.id,
              name: d.name,
              type: d.type,
              uploadedAt: d.uploadedAt.toISOString(),
              fileUrl: d.fileUrl,
            }))}
          />
        </div>
      </div>
    </div>
  )
}
