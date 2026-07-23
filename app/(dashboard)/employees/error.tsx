"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCcw } from "lucide-react"

export default function EmployeesError({
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <div className="space-y-6 p-8 animate-fade-in">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="font-heading text-lg font-medium">Something went wrong</h3>
          <p className="text-muted-foreground text-sm mt-1 mb-4">
            Failed to load the employees page. Please try again.
          </p>
          <Button variant="outline" onClick={() => unstable_retry()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
