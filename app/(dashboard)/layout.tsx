import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { DashboardShell } from "./_components/DashboardShell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <DashboardShell user={session.user}>
        {children}
      </DashboardShell>
      <Toaster />
    </ThemeProvider>
  )
}