import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  UserPlus,
  CalendarCheck,
  Plane,
  Banknote,
  TrendingUp,
  FileText,
  BarChart3,
  Settings,
  LucideIcon,
} from "lucide-react"

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  roles: string[]
}

export const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: [
      "SUPER_ADMINISTRATOR",
      "HR_ADMINISTRATOR",
      "DEPARTMENT_HEAD",
      "EMPLOYEE",
    ],
  },
  {
    title: "Employees",
    href: "/employees",
    icon: Users,
    roles: ["SUPER_ADMINISTRATOR", "HR_ADMINISTRATOR", "DEPARTMENT_HEAD"],
  },
  {
    title: "Departments",
    href: "/departments",
    icon: Building2,
    roles: ["SUPER_ADMINISTRATOR", "HR_ADMINISTRATOR"],
  },
  {
    title: "Positions",
    href: "/positions",
    icon: Briefcase,
    roles: ["SUPER_ADMINISTRATOR", "HR_ADMINISTRATOR"],
  },
  {
    title: "Recruitment",
    href: "/recruitment",
    icon: UserPlus,
    roles: ["SUPER_ADMINISTRATOR", "HR_ADMINISTRATOR"],
  },
  {
    title: "Attendance",
    href: "/attendance",
    icon: CalendarCheck,
    roles: ["SUPER_ADMINISTRATOR", "HR_ADMINISTRATOR"],
  },
  {
    title: "Leave",
    href: "/leave",
    icon: Plane,
    roles: [
      "SUPER_ADMINISTRATOR",
      "HR_ADMINISTRATOR",
      "DEPARTMENT_HEAD",
      "EMPLOYEE",
    ],
  },
  {
    title: "Payroll",
    href: "/payroll",
    icon: Banknote,
    roles: ["SUPER_ADMINISTRATOR", "HR_ADMINISTRATOR"],
  },
  {
    title: "Performance",
    href: "/performance",
    icon: TrendingUp,
    roles: ["SUPER_ADMINISTRATOR", "HR_ADMINISTRATOR", "DEPARTMENT_HEAD"],
  },
  {
    title: "Documents",
    href: "/documents",
    icon: FileText,
    roles: ["SUPER_ADMINISTRATOR", "HR_ADMINISTRATOR", "EMPLOYEE"],
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
    roles: ["SUPER_ADMINISTRATOR", "HR_ADMINISTRATOR"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["SUPER_ADMINISTRATOR"],
  },
]

export function getNavigationForRole(role: string): NavItem[] {
  return navigation.filter((item) => item.roles.includes(role))
}