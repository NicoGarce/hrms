import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase } from "lucide-react"
import { PositionsTable } from "./_components/PositionsTable"
import { PositionSheet } from "./_components/PositionSheet"

interface Position {
  id: string
  title: string
  departmentId: string
  level: string
  description: string | null
  department: {
    id: string
    name: string
    code: string
  }
  _count: {
    employees: number
  }
}

interface Department {
  id: string
  name: string
  code: string
}

const ALLOWED_ROLES = ["SUPER_ADMINISTRATOR", "HR_ADMINISTRATOR"]

export default async function PositionsPage() {
  const session = await auth()

  if (!session?.user?.role || !ALLOWED_ROLES.includes(session.user.role as string)) {
    redirect("/dashboard")
  }

  const positions = await prisma.position.findMany({
    where: { deletedAt: null },
    orderBy: { title: "asc" },
    include: {
      department: { select: { id: true, name: true, code: true } },
      _count: {
        select: { employees: true }
      }
    }
  })

  const departments = await prisma.department.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, code: true },
    orderBy: { name: "asc" }
  })

  return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Positions</h1>
            <p className="text-muted-foreground">Manage job positions</p>
          </div>
          <PositionSheet departments={departments} />
        </div>

        <Card accent="brass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              All Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PositionsTable positions={positions} departments={departments} />
          </CardContent>
        </Card>
      </div>
  )
}
