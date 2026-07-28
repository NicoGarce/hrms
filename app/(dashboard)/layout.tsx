import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardShell } from "./_components/DashboardShell"
import { SessionProvider } from "@/components/session-provider"
import { ThemeApplier } from "@/components/theme-applier"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const company = await prisma.companySetting.findFirst({
    select: { theme: true },
  })

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeApplier theme={company?.theme || "teal"} />
      <SessionProvider>
        <DashboardShell user={session.user}>
          {children}
        </DashboardShell>
      </SessionProvider>
      <Toaster />
    </ThemeProvider>
  )
}