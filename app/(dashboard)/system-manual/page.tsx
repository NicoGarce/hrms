"use client"

import { useState, useMemo } from "react"
import { BookOpen, Users, Building2, Briefcase, CalendarCheck, Plane, Banknote, TrendingUp, UserPlus, FileText, BarChart3, Settings, Search, Command, LayoutDashboard, ChevronRight, X } from "lucide-react"
import Link from "next/link"

interface Section {
  id: string
  title: string
  icon: any
  href?: string
  roles?: string[]
  text: string
  content: React.ReactNode
}

const sections: Section[] = [
  {
    id: "overview",
    title: "Overview",
    icon: BookOpen,
    text: "HRMS is a comprehensive platform for managing employees, departments, attendance, leave, payroll, performance reviews, recruitment, and company documents. Supports four roles: Super Administrator, HR Administrator, Department Head, and Employee. Command palette shortcut CmdOrCtrl+K to search pages, employees, departments, positions, and leave types.",
    content: (
      <>
        <p className="text-muted-foreground">
          The HRMS (Human Resource Management System) is a comprehensive platform for managing
          employees, departments, attendance, leave, payroll, performance reviews, recruitment,
          and company documents. The system supports four roles: <strong>Super Administrator</strong>,
          <strong> HR Administrator</strong>, <strong>Department Head</strong>, and <strong>Employee</strong>,
          each with a tailored set of features and permissions.
        </p>
        <p className="text-muted-foreground mt-4">
          Access the command palette anytime with <kbd className="px-1.5 py-0.5 rounded border bg-muted text-xs font-mono">⌘K</kbd> to
          quickly search pages, employees, departments, positions, and leave types.
        </p>
      </>
    ),
  },
  {
    id: "roles",
    title: "Roles & Permissions",
    icon: Users,
    text: "Super Administrator has full access to every module including settings, users, roles, permissions, company settings, and audit logs. HR Administrator manages employees, departments, positions, recruitment, payroll, performance reviews, reports, and documents. Department Head views employees in their department, manages attendance, leave requests, performance reviews, and views own payslips. Employee views own profile, submits leave requests, views payslips and documents, and sees the dashboard.",
    content: (
      <>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-chart-4">Super Administrator</h4>
            <p className="text-sm text-muted-foreground">Full access to every module. Can manage users, roles, permissions, company settings, and all
            system configurations. This is the only role with access to the Settings area.</p>
          </div>
          <div>
            <h4 className="font-semibold text-chart-3">HR Administrator</h4>
            <p className="text-sm text-muted-foreground">Manages employees, departments, positions, recruitment, payroll, performance reviews, reports,
            and documents. Cannot access system settings (users, roles, audit logs, company info).</p>
          </div>
          <div>
            <h4 className="font-semibold text-chart-2">Department Head</h4>
            <p className="text-sm text-muted-foreground">Views employees in their department, manages attendance and leave requests for their team,
            accesses performance reviews, and views their own payslips. Cannot create/edit employees or access payroll.</p>
          </div>
          <div>
            <h4 className="font-semibold text-chart-1">Employee</h4>
            <p className="text-sm text-muted-foreground">Views their own profile, submits leave requests, views their payslips and documents,
            and sees the dashboard. Cannot manage other users or access administrative features.</p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    text: "High-level overview page with summary cards: Employee Count total active employees, Attendance Sparkline trend chart showing present vs absent counts with hover details, Department Donut employee distribution by department with colored segments and percentages, Leave Requests recent requests awaiting action, Upcoming Holidays next public holidays, Pending Approvals for Super Admin, HR Admin, and Department Head.",
    content: (
      <>
        <p className="text-muted-foreground">
          The Dashboard provides a high-level overview with summary cards and charts:
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground mt-4">
          <li><strong>Employee Count</strong> — total active employees in the organization</li>
          <li><strong>Attendance Sparkline</strong> — a trend chart showing present vs absent counts over recent days, with daily breakdowns on hover</li>
          <li><strong>Department Donut</strong> — employee distribution by department with color-coded segments and percentage labels</li>
          <li><strong>Leave Requests</strong> — recent leave requests awaiting action (for admins/managers) or your own recent requests (for employees)</li>
          <li><strong>Upcoming Holidays</strong> — next public holidays on the calendar</li>
          <li><strong>Pending Approvals</strong> — items needing your approval (shown to Super Admin, HR Admin, and Department Head)</li>
        </ul>
      </>
    ),
  },
  {
    id: "employees",
    title: "Employees",
    icon: Users,
    href: "/employees",
    roles: ["SUPER_ADMINISTRATOR", "HR_ADMINISTRATOR", "DEPARTMENT_HEAD"],
    text: "Central directory of all personnel. Employee List shows sortable table with name, employee code, department, position, status, and hire date. Employee Detail shows personal info, contact, department, position, emergency contact, address. Create/Edit for Super Admin and HR Admin requires selecting department, position, hire date, and linking to existing user. Statuses: ACTIVE, ON LEAVE, TERMINATED, PROBATION.",
    content: (
      <>
        <p className="text-muted-foreground">
          The Employees module is the central directory of all personnel.
        </p>
        <h4 className="font-semibold mt-4">Employee List</h4>
        <p className="text-sm text-muted-foreground">
          Displays all employees in a sortable table. Each row shows name, employee code, department, position, status, and hire date.
          Click an employee to view their full profile. Filter by department or status.
        </p>
        <h4 className="font-semibold mt-4">Employee Detail</h4>
        <p className="text-sm text-muted-foreground">
          Shows personal information, contact details, department, position, emergency contact, and address.
          Super Admin and HR Admin can edit from this page.
        </p>
        <h4 className="font-semibold mt-4">Create / Edit Employee</h4>
        <p className="text-sm text-muted-foreground">
          Available to Super Admin and HR Admin. Requires selecting a department, position, setting a hire date, and linking to an existing
          user account. The employee code is auto-generated.
        </p>
        <h4 className="font-semibold mt-4">Employee Statuses</h4>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-chart-3/10 text-chart-3">ACTIVE</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-chart-2/10 text-chart-2">ON LEAVE</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-chart-4/10 text-chart-4">TERMINATED</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-chart-1/10 text-chart-1">PROBATION</span>
        </div>
      </>
    ),
  },
  {
    id: "departments",
    title: "Departments",
    icon: Building2,
    href: "/departments",
    roles: ["SUPER_ADMINISTRATOR", "HR_ADMINISTRATOR"],
    text: "Manage organizational departments with unique code, name, optional description, and optional head. Departments are created and edited inline via a side sheet modal. Soft-delete is used when removing departments.",
    content: (
      <>
        <p className="text-muted-foreground">
          Manage organizational departments. Each department has a unique code, name, optional description, and an optional head.
          Departments can be created and edited inline via a side sheet modal.
        </p>
        <p className="text-sm text-muted-foreground mt-4">
          When a department is deleted, it is soft-deleted (hidden from active views but preserved in the database).
        </p>
      </>
    ),
  },
  {
    id: "positions",
    title: "Positions",
    icon: Briefcase,
    href: "/positions",
    roles: ["SUPER_ADMINISTRATOR", "HR_ADMINISTRATOR"],
    text: "Define job positions within departments. Each position has unique title, department assignment, and level: Junior, Mid, Senior, Lead, Executive. Optional description. Created and edited inline via side sheet modal. Soft-delete is used.",
    content: (
      <>
        <p className="text-muted-foreground">
          Define job positions within departments. Each position has a unique title, a department assignment,
          a level (Junior, Mid, Senior, Lead, Executive), and an optional description.
        </p>
        <p className="text-sm text-muted-foreground mt-4">
          Positions can be created and edited inline via a side sheet modal. Like departments, positions use soft-delete.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted">JUNIOR</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted">MID</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted">SENIOR</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted">LEAD</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted">EXECUTIVE</span>
        </div>
      </>
    ),
  },
  {
    id: "attendance",
    title: "Attendance",
    icon: CalendarCheck,
    href: "/attendance",
    roles: ["SUPER_ADMINISTRATOR", "HR_ADMINISTRATOR", "DEPARTMENT_HEAD"],
    text: "Track daily employee attendance. Daily Attendance: select date, mark employees as Present, Absent, Late, or Half Day grouped by department. Time Logs: check-in and check-out times. Overtime: log hours beyond standard time. Holidays: manage company holidays with name, date, and type. Statuses: PRESENT, ABSENT, LATE, HALF DAY.",
    content: (
      <>
        <p className="text-muted-foreground">
          Track daily employee attendance with mark/unmark functionality. Available to Super Admin, HR Admin, and Department Head.
        </p>
        <h4 className="font-semibold mt-4">Daily Attendance</h4>
        <p className="text-sm text-muted-foreground">
          Select a date and mark employees as Present, Absent, Late, or Half Day. Employees are shown grouped by department.
          Toggle between mark/unmark for each employee on the selected date.
        </p>
        <h4 className="font-semibold mt-4">Time Logs</h4>
        <p className="text-sm text-muted-foreground">
          View check-in and check-out times recorded for employees, with daily and weekly summaries.
        </p>
        <h4 className="font-semibold mt-4">Overtime</h4>
        <p className="text-sm text-muted-foreground">
          Log and track overtime hours. Each entry records hours worked beyond standard time.
        </p>
        <h4 className="font-semibold mt-4">Holidays</h4>
        <p className="text-sm text-muted-foreground">
          Manage company holidays. Holidays are marked on the attendance calendar and used in reports.
          Each holiday has a name, date, and type (PUBLIC by default).
        </p>
        <h4 className="font-semibold mt-4">Attendance Statuses</h4>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-chart-3/10 text-chart-3">PRESENT</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-chart-4/10 text-chart-4">ABSENT</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-chart-1/10 text-chart-1">LATE</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-chart-2/10 text-chart-2">HALF DAY</span>
        </div>
      </>
    ),
  },
  {
    id: "leave",
    title: "Leave Management",
    icon: Plane,
    href: "/leave",
    text: "Complete leave management for all roles. Leave Requests: employees submit with type, dates, reason. Super Admin, HR Admin, Department Head approve or reject. Leave Types: configure Annual, Sick, Personal with allocated days and carry-forward. Leave Calendar: calendar view of approved leave color-coded by department. Statuses: PENDING, APPROVED, REJECTED.",
    content: (
      <>
        <p className="text-muted-foreground">
          Complete leave management system available to all roles (with different capabilities per role).
        </p>
        <h4 className="font-semibold mt-4">Leave Requests</h4>
        <p className="text-sm text-muted-foreground">
          Employees submit leave requests selecting a leave type, start/end dates, and reason.
          Super Admin, HR Admin, and Department Head can approve or reject pending requests.
        </p>
        <h4 className="font-semibold mt-4">Leave Types</h4>
        <p className="text-sm text-muted-foreground">
          Configure leave types (e.g., Annual, Sick, Personal) with allocated days per year and optional
          carry-forward. Managed by Super Admin and HR Admin.
        </p>
        <h4 className="font-semibold mt-4">Leave Calendar</h4>
        <p className="text-sm text-muted-foreground">
          Calendar view showing all approved leave across the organization, color-coded by department.
          Helps managers see team availability at a glance.
        </p>
        <h4 className="font-semibold mt-4">Leave Statuses</h4>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600">PENDING</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-chart-3/10 text-chart-3">APPROVED</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">REJECTED</span>
        </div>
      </>
    ),
  },
  {
    id: "payroll",
    title: "Payroll",
    icon: Banknote,
    href: "/payroll",
    roles: ["SUPER_ADMINISTRATOR", "HR_ADMINISTRATOR"],
    text: "Manage employee compensation records. Payroll Records: create per employee per month/year with base salary, gross salary, net salary, and items. Payroll Items: Allowance additions, Deduction subtractions, Bonus one-time payments with name and amount. Payroll History: view all processed payrolls filterable by month, year, department. Statuses: DRAFT, PROCESSED, PAID.",
    content: (
      <>
        <p className="text-muted-foreground">
          The Payroll module manages employee compensation records. Accessible only to Super Admin and HR Admin.
        </p>
        <h4 className="font-semibold mt-4">Payroll Records</h4>
        <p className="text-sm text-muted-foreground">
          Create payroll records for each employee per month/year. Each record includes base salary, gross salary,
          net salary, and a list of payroll items (allowances, deductions, bonuses).
        </p>
        <h4 className="font-semibold mt-4">Payroll Items</h4>
        <p className="text-sm text-muted-foreground">
          Add individual line items to a payroll record. Items can be of type Allowance (additions to base),
          Deduction (subtractions from base), or Bonus (one-time payments). Each item has a name and amount.
        </p>
        <h4 className="font-semibold mt-4">Payroll History</h4>
        <p className="text-sm text-muted-foreground">
          View all processed payrolls across the organization, filterable by month, year, and department.
        </p>
        <h4 className="font-semibold mt-4">Payroll Statuses</h4>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted">DRAFT</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600">PROCESSED</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-chart-3/10 text-chart-3">PAID</span>
        </div>
      </>
    ),
  },
  {
    id: "payslips",
    title: "My Payslips",
    icon: Banknote,
    href: "/payslips",
    text: "Available to all roles. Read-only view of own payroll records. Payslips are automatically available once a payroll record is created by HR. Displays pay period, base salary, itemized allowances, deductions, bonuses, gross salary, and net salary. Supports printing or downloading.",
    content: (
      <>
        <p className="text-muted-foreground">
          Available to all roles. Each user can view their own payslips — a read-only view of their payroll records.
          Payslips are automatically available once a payroll record is created for the employee by HR.
        </p>
        <p className="text-sm text-muted-foreground mt-4">
          Each payslip displays the pay period, base salary, itemized allowances/deductions/bonuses, gross salary,
          and net salary. Supports printing or downloading for personal records.
        </p>
      </>
    ),
  },
  {
    id: "performance",
    title: "Performance Reviews",
    icon: TrendingUp,
    href: "/performance",
    roles: ["SUPER_ADMINISTRATOR", "HR_ADMINISTRATOR", "DEPARTMENT_HEAD"],
    text: "Conduct and manage employee performance reviews. Create reviews with goals, KPI ratings JSON, overall rating, and feedback. Stages: DRAFT, SUBMITTED, REVIEWED, APPROVED.",
    content: (
      <>
        <p className="text-muted-foreground">
          Conduct and manage employee performance reviews. Available to Super Admin, HR Admin, and Department Head.
        </p>
        <h4 className="font-semibold mt-4">Reviews</h4>
        <p className="text-sm text-muted-foreground">
          Create performance reviews for employees with goals, KPI ratings (JSON), overall rating, and feedback.
          Reviews go through stages: Draft → Submitted → Reviewed → Approved.
        </p>
        <h4 className="font-semibold mt-4">Review Statuses</h4>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted">DRAFT</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600">SUBMITTED</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-chart-2/10 text-chart-2">REVIEWED</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-chart-3/10 text-chart-3">APPROVED</span>
        </div>
      </>
    ),
  },
  {
    id: "recruitment",
    title: "Recruitment",
    icon: UserPlus,
    href: "/recruitment",
    roles: ["SUPER_ADMINISTRATOR", "HR_ADMINISTRATOR"],
    text: "End-to-end recruitment pipeline. Jobs: post openings with title, department, description, requirements in DRAFT, OPEN, or CLOSED status. Applicants: track through pipeline stages Applied, Screening, Interview, Offer, HIRED, REJECTED. Hiring Status: dashboard view with counts per stage for each job.",
    content: (
      <>
        <p className="text-muted-foreground">
          End-to-end recruitment pipeline. Accessible to Super Admin and HR Admin.
        </p>
        <h4 className="font-semibold mt-4">Jobs</h4>
        <p className="text-sm text-muted-foreground">
          Post job openings with title, department, full description, and requirements. Jobs can be in Draft,
          Open, or Closed status. Open jobs accept applicant submissions.
        </p>
        <h4 className="font-semibold mt-4">Applicants</h4>
        <p className="text-sm text-muted-foreground">
          Track applicants through the hiring pipeline. Each applicant is linked to a job and progresses through
          stages: Applied → Screening → Interview → Offer → Hired (or Rejected).
        </p>
        <h4 className="font-semibold mt-4">Hiring Status</h4>
        <p className="text-sm text-muted-foreground">
          Dashboard-style view of the recruitment pipeline with counts per stage for each job.
        </p>
        <h4 className="font-semibold mt-4">Applicant Statuses</h4>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted">APPLIED</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600">SCREENING</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-chart-2/10 text-chart-2">INTERVIEW</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-chart-3/10 text-chart-3">OFFER</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600">HIRED</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">REJECTED</span>
        </div>
      </>
    ),
  },
  {
    id: "documents",
    title: "Documents",
    icon: FileText,
    href: "/documents",
    text: "Upload and manage employee documents. Categorized by type: Contract, ID, Certificate, Other. Each document associated with an employee. Admins view and manage all documents; employees see only their own.",
    content: (
      <>
        <p className="text-muted-foreground">
          Upload and manage employee documents. Available to Super Admin, HR Admin, and Employees (own documents).
        </p>
        <p className="text-sm text-muted-foreground mt-4">
          Documents are categorized by type: Contract, ID, Certificate, or Other. Each document is associated
          with an employee and stored with a file URL reference. Admins can view and manage all documents;
          employees see only their own.
        </p>
      </>
    ),
  },
  {
    id: "reports",
    title: "Reports & Analytics",
    icon: BarChart3,
    href: "/reports",
    roles: ["SUPER_ADMINISTRATOR", "HR_ADMINISTRATOR"],
    text: "Generate and export reports. Employee Reports: list and export with filters. Attendance Reports: date range summaries with status breakdowns. Leave Reports: usage analytics by employee, department, leave type. Payroll Reports: cost summaries across departments and time periods. Analytics: cross-module combining headcount trends, attendance patterns, leave balances.",
    content: (
      <>
        <p className="text-muted-foreground">
          Generate and export reports across multiple dimensions. Accessible to Super Admin and HR Admin.
        </p>
        <div className="space-y-4 mt-4">
          <div>
            <h4 className="font-semibold">Employee Reports</h4>
            <p className="text-sm text-muted-foreground">List and export employee data with filters by department, status, and position.</p>
          </div>
          <div>
            <h4 className="font-semibold">Attendance Reports</h4>
            <p className="text-sm text-muted-foreground">Summarize attendance records over date ranges, with present/absent/late/half-day breakdowns.</p>
          </div>
          <div>
            <h4 className="font-semibold">Leave Reports</h4>
            <p className="text-sm text-muted-foreground">Leave usage analytics by employee, department, and leave type.</p>
          </div>
          <div>
            <h4 className="font-semibold">Payroll Reports</h4>
            <p className="text-sm text-muted-foreground">Payroll cost summaries across departments and time periods.</p>
          </div>
          <div>
            <h4 className="font-semibold">Analytics</h4>
            <p className="text-sm text-muted-foreground">Cross-module analytics combining headcount trends, attendance patterns, and leave balances.</p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
    href: "/settings",
    roles: ["SUPER_ADMINISTRATOR"],
    text: "System configuration for Super Administrator only. Company Settings: name, address, phone, email, logo, timezone, currency. Users: create, edit, deactivate accounts and assign roles. Roles & Permissions: define roles and granular resource-level permissions. Notifications: view and manage notifications with mark as read. Audit Logs: complete audit trail searchable with CSV export.",
    content: (
      <>
        <p className="text-muted-foreground">
          System configuration area. Only accessible to Super Administrator.
        </p>
        <div className="space-y-4 mt-4">
          <div>
            <h4 className="font-semibold">Company Settings</h4>
            <p className="text-sm text-muted-foreground">Configure company name, address, phone, email, logo, timezone, and currency.</p>
          </div>
          <div>
            <h4 className="font-semibold">Users</h4>
            <p className="text-sm text-muted-foreground">Manage system users. Create, edit, and deactivate user accounts and assign roles.</p>
          </div>
          <div>
            <h4 className="font-semibold">Roles & Permissions</h4>
            <p className="text-sm text-muted-foreground">Define roles and granular resource-level permissions (create, read, update, delete per module).</p>
          </div>
          <div>
            <h4 className="font-semibold">Notifications</h4>
            <p className="text-sm text-muted-foreground">View and manage system notifications. Mark individual or all notifications as read.</p>
          </div>
          <div>
            <h4 className="font-semibold">Audit Logs</h4>
            <p className="text-sm text-muted-foreground">Complete audit trail of all system actions. Searchable, sortable, with CSV export.
            Tracks who performed what action, on which resource, and when.</p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: "search",
    title: "System Search",
    icon: Search,
    text: "Command palette CmdOrCtrl+K provides unified search. Pages: navigate to any system page based on role. Employees: search by name or employee code, click to view profile. Departments: search by name or code. Positions: search by title. Leave Types: search by name.",
    content: (
      <>
        <p className="text-muted-foreground">
          The command palette (<kbd className="px-1.5 py-0.5 rounded border bg-muted text-xs font-mono">⌘K</kbd>) provides
          unified search across the entire system. Results are grouped by category:
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground mt-4">
          <li><strong>Pages</strong> — navigate to any system page based on your role</li>
          <li><strong>Employees</strong> — search by name or employee code, click to view profile</li>
          <li><strong>Departments</strong> — search by name or code</li>
          <li><strong>Positions</strong> — search by title</li>
          <li><strong>Leave Types</strong> — search by name</li>
        </ul>
      </>
    ),
  },
  {
    id: "navigation",
    title: "Navigation",
    icon: ChevronRight,
    text: "Sidebar shows navigation items relevant to your role. Collapse button at bottom to switch between expanded and icon-only mode. Mobile: hamburger menu in header. Header includes search CmdOrCtrl+K, theme toggle dark/light, notifications dropdown, user menu with profile, settings, logout.",
    content: (
      <>
        <p className="text-muted-foreground">
          The sidebar on the left shows navigation items relevant to your role. Use the collapse button at the bottom
          to switch between expanded and icon-only mode. On mobile, the sidebar is accessible via the hamburger menu
          in the header bar.
        </p>
        <p className="text-sm text-muted-foreground mt-4">
          The header bar also includes: search button (<kbd className="px-1.5 py-0.5 rounded border bg-muted text-xs font-mono">⌘K</kbd>),
          theme toggle (dark/light mode), notifications dropdown, and user menu with profile, settings, and logout links.
        </p>
      </>
    ),
  },
]

export default function SystemManualPage() {
  const [query, setQuery] = useState("")
  const [showCredentials, setShowCredentials] = useState(false)

  const filtered = useMemo(() => {
    if (!query.trim()) return sections
    const q = query.toLowerCase()
    return sections.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.text.toLowerCase().includes(q)
    )
  }, [query])

  const highlight = (text: string) => {
    if (!query.trim()) return text
    const q = query.toLowerCase()
    const idx = text.toLowerCase().indexOf(q)
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <mark className="rounded bg-yellow-200 dark:bg-yellow-800 px-0.5">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    )
  }

  return (
    <div className="space-y-8 p-8 animate-fade-in max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold">System Manual</h1>
          <p className="text-muted-foreground">Complete guide to the HR Management System</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search the manual..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="w-full h-11 pl-10 pr-10 rounded-lg border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-10 w-10 text-muted-foreground/40 mb-4" />
          <p className="text-lg font-medium">No results found</p>
          <p className="text-sm text-muted-foreground">
            No sections match &ldquo;{query}&rdquo;
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{filtered.length} section{filtered.length !== 1 && "s"}</span>
          </div>

          {query && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {filtered.map((s) => {
                const Icon = s.icon
                return (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    {s.title}
                  </a>
                )
              })}
            </div>
          )}

          <div className="space-y-12">
            {filtered.map((s) => {
              const Icon = s.icon
              return (
                <section key={s.id} id={s.id} className="scroll-mt-20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <h2 className="font-heading text-xl font-bold">{query ? highlight(s.title) : s.title}</h2>
                    {s.href && (
                      <Link href={s.href} className="text-xs text-muted-foreground hover:text-foreground underline ml-auto">
                        Go to page →
                      </Link>
                    )}
                  </div>
                  {s.roles && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {s.roles.map((r) => (
                        <span key={r} className="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-muted text-muted-foreground">
                          {r.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  )}
                  {query && (
                    <p className="text-xs text-muted-foreground mb-3 italic">
                      {highlight(
                        s.text.slice(0, 200) + (s.text.length > 200 ? "..." : "")
                      )}
                    </p>
                  )}
                  <div className="rounded-lg border bg-card p-6">
                    {s.content}
                  </div>
                </section>
              )
            })}
          </div>

          <div className="border-t pt-8 mt-8">
            <button
              onClick={() => setShowCredentials(!showCredentials)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
            >
              <span className="select-none">{showCredentials ? "▾" : "▸"}</span>
              {showCredentials ? "Hide" : "Show"} Login Credentials
            </button>

            {showCredentials && (
              <div className="mt-6 space-y-8 animate-in fade-in slide-in-from-top-2 duration-200">
                <div>
                  <h3 className="font-heading text-lg font-bold mb-4">Super Administrator</h3>
                  <div className="rounded-lg border bg-card p-4 space-y-1.5 text-sm">
                    <div className="grid grid-cols-[120px_1fr] gap-x-4">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-mono">admin@company.com</span>
                      <span className="text-muted-foreground">Password</span>
                      <span className="font-mono">AdminPass123!</span>
                      <span className="text-muted-foreground">Role</span>
                      <span>SUPER_ADMINISTRATOR</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-lg font-bold mb-4">HR Administrator</h3>
                  <div className="rounded-lg border bg-card p-4 space-y-1.5 text-sm">
                    <div className="grid grid-cols-[120px_1fr] gap-x-4">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-mono">sarah.williams@company.com</span>
                      <span className="text-muted-foreground">Password</span>
                      <span className="font-mono">Password123!</span>
                      <span className="text-muted-foreground">Role</span>
                      <span>HR_ADMINISTRATOR</span>
                      <span className="text-muted-foreground">Employee</span>
                      <span>Sarah Williams (EMP004)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-lg font-bold mb-4">Department Head</h3>
                  <div className="rounded-lg border bg-card p-4 space-y-1.5 text-sm">
                    <div className="grid grid-cols-[120px_1fr] gap-x-4">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-mono">jane.smith@company.com</span>
                      <span className="text-muted-foreground">Password</span>
                      <span className="font-mono">Password123!</span>
                      <span className="text-muted-foreground">Role</span>
                      <span>DEPARTMENT_HEAD</span>
                      <span className="text-muted-foreground">Employee</span>
                      <span>Jane Smith (EMP002)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-lg font-bold mb-4">Employees</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { name: "John Doe", email: "john.doe@company.com", code: "EMP001", role: "EMPLOYEE", dept: "Engineering" },
                      { name: "Mike Johnson", email: "mike.johnson@company.com", code: "EMP003", role: "EMPLOYEE", dept: "Human Resources", note: "ON LEAVE" },
                      { name: "Tom Brown", email: "tom.brown@company.com", code: "EMP005", role: "EMPLOYEE", dept: "Sales", note: "PROBATION" },
                      { name: "Lisa Davis", email: "lisa.davis@company.com", code: "EMP006", role: "EMPLOYEE", dept: "Engineering" },
                      { name: "Bob Miller", email: "bob.miller@company.com", code: "EMP007", role: "EMPLOYEE", dept: "Marketing" },
                      { name: "Amy Wilson", email: "amy.wilson@company.com", code: "EMP008", role: "EMPLOYEE", dept: "Sales" },
                    ].map((emp) => (
                      <div key={emp.code} className="rounded-lg border bg-card p-3 text-sm space-y-1">
                        <div className="font-medium">{emp.name}</div>
                        <div className="text-muted-foreground font-mono text-xs">{emp.email}</div>
                        <div className="grid grid-cols-[90px_1fr] gap-x-2 text-xs text-muted-foreground">
                          <span>Password</span>
                          <span className="font-mono">Password123!</span>
                          <span>Code</span>
                          <span className="font-mono">{emp.code}</span>
                          <span>Dept</span>
                          <span>{emp.dept}</span>
                        </div>
                        {emp.note && (
                          <span className="inline-block mt-1 rounded bg-yellow-500/10 text-yellow-600 text-[10px] font-medium px-1.5 py-0.5 uppercase tracking-wider">
                            {emp.note}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-xs text-muted-foreground space-y-1">
                  <p><strong>Note:</strong> All passwords are case-sensitive. Default session timeout is 24 hours.</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
