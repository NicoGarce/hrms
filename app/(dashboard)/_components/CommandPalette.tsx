"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { getNavigationForRole } from "@/lib/navigation"
import { LayoutDashboard, Users, Building2, Briefcase, UserPlus, CalendarCheck, Plane, Banknote, TrendingUp, FileText, BarChart3, Settings, BookOpen, ArrowRight } from "lucide-react"

const pageIcons: Record<string, any> = {
  Dashboard: LayoutDashboard,
  Employees: Users,
  Departments: Building2,
  Positions: Briefcase,
  Recruitment: UserPlus,
  Attendance: CalendarCheck,
  Leave: Plane,
  Payroll: Banknote,
  "My Payslips": Banknote,
  Performance: TrendingUp,
  Documents: FileText,
  Reports: BarChart3,
  Settings: Settings,
  "System Manual": BookOpen,
}

interface SearchResult {
  employees: { id: string; firstName: string; lastName: string; employeeCode: string }[]
  departments: { id: string; name: string; code: string }[]
  positions: { id: string; title: string; department: { name: string } | null }[]
  leaveTypes: { id: string; name: string; daysAllowed: number }[]
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()

  const pages = getNavigationForRole(session?.user?.role || "EMPLOYEE")

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, onOpenChange])

  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 1) { setResults(null); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      if (!res.ok) { setResults(null); return }
      const data = await res.json()
      setResults(data)
    } catch {
      setResults(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchResults(query), 150)
    return () => clearTimeout(timer)
  }, [query, fetchResults])

  const navigate = (href: string) => {
    router.push(href)
    onOpenChange(false)
  }

  const filteredPages = query
    ? pages.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()))
    : pages

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Search pages, employees, departments..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {query.length > 0 && results && !results.employees.length && !results.departments.length && !results.positions.length && !results.leaveTypes.length && filteredPages.length === 0 && !(query && "System Manual".toLowerCase().includes(query.toLowerCase())) && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}

          {(filteredPages.length > 0 || (query && "System Manual".toLowerCase().includes(query.toLowerCase()))) && (
            <CommandGroup heading="Pages">
              {filteredPages.map((page) => {
                const Icon = pageIcons[page.title] || ArrowRight
                const isActive = pathname === page.href
                return (
                  <CommandItem
                    key={page.href}
                    onSelect={() => navigate(page.href)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{page.title}</span>
                    {isActive && <span className="ml-auto text-xs text-muted-foreground">current</span>}
                  </CommandItem>
                )
              })}
              {query && "System Manual".toLowerCase().includes(query.toLowerCase()) && (
                <CommandItem onSelect={() => navigate("/system-manual")}>
                  <BookOpen className="h-4 w-4" />
                  <span>System Manual</span>
                </CommandItem>
              )}
            </CommandGroup>
          )}

          {results && query.length > 0 && (
            <>
              {filteredPages.length > 0 && <CommandSeparator />}

              {results.employees.length > 0 && (
                <CommandGroup heading="Employees">
                  {results.employees.map((emp) => (
                    <CommandItem
                      key={emp.id}
                      onSelect={() => navigate(`/employees/${emp.id}`)}
                      value={`${emp.firstName} ${emp.lastName} ${emp.employeeCode}`}
                    >
                      <Users className="h-4 w-4" />
                      <span>{emp.firstName} {emp.lastName}</span>
                      <span className="ml-auto text-xs text-muted-foreground font-mono">{emp.employeeCode}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {results.departments.length > 0 && (
                <CommandGroup heading="Departments">
                  {results.departments.map((dept) => (
                    <CommandItem
                      key={dept.id}
                      onSelect={() => navigate("/departments")}
                    >
                      <Building2 className="h-4 w-4" />
                      <span>{dept.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground font-mono">{dept.code}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {results.positions.length > 0 && (
                <CommandGroup heading="Positions">
                  {results.positions.map((pos) => (
                    <CommandItem
                      key={pos.id}
                      onSelect={() => navigate("/positions")}
                    >
                      <Briefcase className="h-4 w-4" />
                      <span>{pos.title}</span>
                      {pos.department && (
                        <span className="ml-auto text-xs text-muted-foreground">{pos.department.name}</span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {results.leaveTypes.length > 0 && (
                <CommandGroup heading="Leave Types">
                  {results.leaveTypes.map((lt) => (
                    <CommandItem
                      key={lt.id}
                      onSelect={() => navigate("/leave")}
                    >
                      <Plane className="h-4 w-4" />
                      <span>{lt.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{lt.daysAllowed} days</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
