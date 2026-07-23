import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export async function ActivityFeed() {
  const [announcements, birthdays] = await Promise.all([
    prisma.announcement.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      where: {
        OR: [{ expiresAt: { gte: new Date() } }, { expiresAt: null }],
      },
    }),
    prisma.employeeProfile.findMany({
      where: { dateOfBirth: { not: null } },
      take: 3,
      include: { employee: true },
    }),
  ])

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case "HIGH":
        return "bg-red-500"
      case "NORMAL":
        return "bg-blue-500"
      case "LOW":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
              Announcements
            </h3>
            <div className="space-y-3">
              {announcements.length === 0 ? (
                <p className="text-sm text-muted-foreground">No announcements</p>
              ) : (
                announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="flex gap-3 items-start"
                  >
                    <div
                      className={`h-2 w-2 rounded-full mt-2 ${getPriorityColor(
                        announcement.priority
                      )}`}
                    />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {announcement.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {announcement.content}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(announcement.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
              Upcoming Birthdays
            </h3>
            <div className="space-y-3">
              {birthdays.length === 0 ? (
                <p className="text-sm text-muted-foreground">No birthdays</p>
              ) : (
                birthdays.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex gap-3 items-center"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {getInitials(
                          `${profile.employee.firstName} ${profile.employee.lastName}`
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {profile.employee.firstName} {profile.employee.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {profile.dateOfBirth
                          ? format(new Date(profile.dateOfBirth), "MMMM d")
                          : ""}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
