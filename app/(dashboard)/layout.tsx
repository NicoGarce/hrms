import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { DashboardShell } from "./_components/DashboardShell"
import { SessionProvider } from "@/components/session-provider"

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
      <SessionProvider>
        <DashboardShell user={session.user}>
          {children}
        </DashboardShell>
      </SessionProvider>
      <Toaster />
    </ThemeProvider>
  )
}