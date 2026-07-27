# HRMS System - Current State Documentation

## Project Overview

**Project Name:** HRMS (Human Resource Management System)
**Version:** 0.1.0
**Type:** Web Application
**Last Updated:** July 27, 2026

## Technology Stack

### Frontend Framework
- **Next.js:** 16.2.11 (App Router)
- **React:** 19.2.4
- **TypeScript:** 5.9.3

### UI & Styling
- **Tailwind CSS:** 4.0
- **shadcn/ui:** 4.13.1
- **Lucide React:** 1.25.0 (Icons)
- **next-themes:** 0.4.6 (Theme management)
- **sonner:** 2.0.7 (Toast notifications)

### Database & ORM
- **Prisma:** 5.22.0
- **Database:** PostgreSQL
- **Prisma Client:** 5.22.0

### Authentication
- **NextAuth:** 5.0.0-beta.32
- **bcryptjs:** 3.0.3 (Password hashing)

### Form Handling & Validation
- **react-hook-form:** 7.82.0
- **@hookform/resolvers:** 5.4.0
- **zod:** 4.4.3 (Schema validation)

### Data Visualization
- **recharts:** 3.10.0
- **@tanstack/react-table:** 8.21.3 (Data tables)

### Utilities
- **date-fns:** 4.1.0 (Date manipulation)
- **clsx:** 2.1.1
- **tailwind-merge:** 3.6.0
- **class-variance-authority:** 0.7.1
- **cmdk:** 1.1.1 (Command palette)

## Database Schema

### Core Models

#### Authentication & Authorization
- **User** - User accounts with email/password authentication
- **Role** - User roles (SUPER_ADMINISTRATOR, HR_ADMINISTRATOR, DEPARTMENT_HEAD, EMPLOYEE)
- **Permission** - Granular permissions (resource + action)
- **RolePermission** - Many-to-many relationship between roles and permissions

#### Employee Management
- **Employee** - Employee records with status tracking
- **EmployeeProfile** - Extended employee information (phone, address, emergency contact)
- **Department** - Organizational departments
- **Position** - Job positions with levels (JUNIOR, MID, SENIOR, LEAD, EXECUTIVE)

#### Leave Management
- **LeaveRequest** - Employee leave requests with approval workflow
- **LeaveType** - Leave type definitions (Annual, Sick, Unpaid)
- **Holiday** - Company holidays (public and company-specific)

#### Attendance Management
- **Attendance** - Daily attendance records with check-in/check-out
- **AttendanceStatus** - PRESENT, ABSENT, LATE, HALF_DAY

#### Payroll Management
- **Payroll** - Monthly payroll records
- **PayrollItem** - Individual payroll items (allowances, deductions, bonuses)
- **PayrollStatus** - DRAFT, PROCESSED, PAID

#### Performance Management
- **PerformanceReview** - Employee performance reviews with KPIs and ratings
- **ReviewStatus** - DRAFT, SUBMITTED, REVIEWED, APPROVED

#### Recruitment
- **RecruitmentJob** - Job postings
- **Applicant** - Job applicants with tracking
- **JobStatus** - DRAFT, OPEN, CLOSED
- **ApplicantStatus** - APPLIED, SCREENING, INTERVIEW, OFFER, HIRED, REJECTED

#### Document Management
- **Document** - Employee documents (contracts, IDs, certificates)
- **DocumentType** - CONTRACT, ID, CERTIFICATE, OTHER

#### Communication
- **Announcement** - Company announcements with priority levels
- **Notification** - User notifications

#### System
- **AuditLog** - System audit trail
- **CompanySetting** - Company-wide settings

## Available Features & Modules - Functionality Status

### ✅ 1. Dashboard - PARTIALLY FUNCTIONAL
- **Location:** `app/(dashboard)/dashboard/page.tsx`
- **Status:** UI components implemented, requires API integration for real-time data
- **Components:**
  - StatsGrid
  - AttendanceSparkline
  - DepartmentDonut
  - ActivityFeed
  - QuickActions
- **API:** `/api/dashboard` route exists

### ✅ 2. Employee Management - FULLY FUNCTIONAL
- **Location:** `app/(dashboard)/employees/`
- **Status:** Fully functional with database integration
- **Features:**
  - Employee list view with data table
  - Create new employee
  - Edit employee details
  - Employee profile management
  - Role-based access control (SUPER_ADMIN, HR_ADMIN, DEPARTMENT_HEAD)
  - Error handling
- **API Routes:** `/api/employees`, `/api/employees/[id]`, `/api/employees/search`, `/api/employee/by-email`

### ✅ 3. Department Management - FULLY FUNCTIONAL
- **Location:** `app/(dashboard)/departments/page.tsx`
- **Status:** Fully functional with database integration
- **Features:**
  - Department CRUD operations
  - Department head assignment
  - Employee and position counts
  - Role-based access (SUPER_ADMIN, HR_ADMIN only)
- **API Routes:** `/api/departments`, `/api/departments/[id]`

### ⚠️ 4. Position Management - UI ONLY
- **Location:** `app/(dashboard)/positions/page.tsx`
- **Status:** Page exists, implementation not verified
- **API Routes:** `/api/positions`, `/api/positions/[id]` exist

### ✅ 5. Attendance Management - FULLY FUNCTIONAL
- **Location:** `app/(dashboard)/attendance/`
- **Status:** Fully functional with database integration
- **Features:**
  - Daily attendance tracking with date navigation
  - Check-in/check-out display
  - Status marking (Present, Absent, Late) for admins
  - Holiday detection
  - Leave request integration
  - Role-based filtering (DEPARTMENT_HEAD sees own department)
  - Role-based editing (SUPER_ADMIN, HR_ADMIN only)
- **Sub-pages:** holidays, overtime, time-logs, reports
- **API Routes:** `/api/attendance`, `/api/attendance/holidays`, `/api/attendance/overtime`, `/api/attendance/time-logs`, `/api/attendance/reports`

### ✅ 6. Leave Management - FULLY FUNCTIONAL
- **Location:** `app/(dashboard)/leave/`
- **Status:** Fully functional with database integration
- **Features:**
  - Leave request submission with form validation
  - Leave approval/rejection workflow
  - Status filtering (All, Pending, Approved, Rejected)
  - Role-based access control
  - Leave type selection with days allowed
  - Toast notifications
- **Sub-pages:** calendar, types
- **API Routes:** `/api/leave/requests`, `/api/leave/requests/[id]/approve`, `/api/leave/requests/[id]/reject`, `/api/leave/types`

### ✅ 7. Payroll Management - FULLY FUNCTIONAL
- **Location:** `app/(dashboard)/payroll/`
- **Status:** Fully functional with database integration
- **Features:**
  - Payroll record CRUD operations
  - Employee selection
  - Month/year selection
  - Salary inputs (base, gross, net)
  - Status management (DRAFT, PROCESSED, PAID)
  - Edit and delete functionality
- **Sub-pages:** history, items, payslips
- **API Routes:** `/api/payroll`, `/api/payroll/[id]`, `/api/payroll/items`, `/api/payroll/items/[id]`

### ✅ 8. Performance Management - FULLY FUNCTIONAL
- **Location:** `app/(dashboard)/performance/page.tsx`
- **Status:** Fully functional with database integration
- **Features:**
  - Performance review creation with form validation
  - Rating system (1-5 stars)
  - Goals and KPIs input
  - Feedback submission
  - Draft and submit workflow
  - Review acknowledgment for employees
  - Role-based access (admins can create, employees can acknowledge)
- **API Routes:** `/api/performance/reviews`, `/api/performance/reviews/[id]/acknowledge`

### ✅ 9. Recruitment - FULLY FUNCTIONAL
- **Location:** `app/(dashboard)/recruitment/`
- **Status:** Fully functional with database integration
- **Features:**
  - Job posting CRUD operations
  - Department assignment
  - Description and requirements input
  - Status management (DRAFT, OPEN, CLOSED)
  - Applicant count display
  - Navigation to applicants page
- **Sub-pages:** applicants, hiring-status
- **API Routes:** `/api/recruitment/jobs`, `/api/recruitment/jobs/[id]`, `/api/recruitment/applicants`

### ⚠️ 10. Document Management - UI ONLY
- **Location:** `app/(dashboard)/documents/page.tsx`
- **Status:** Page exists, implementation not verified
- **API Routes:** `/api/documents`, `/api/documents/[id]`, `/api/documents/upload` exist

### ⚠️ 11. Reports & Analytics - NAVIGATION ONLY
- **Location:** `app/(dashboard)/reports/`
- **Status:** Navigation hub implemented, individual report pages need verification
- **Features:**
  - Report type cards with icons
  - Role-based access (Payroll report restricted)
  - Navigation to sub-pages
- **Sub-pages:** analytics, attendance, employees, leave, payroll
- **API Routes:** `/api/reports/*` routes exist

### ✅ 12. Settings - PARTIALLY FUNCTIONAL
- **Location:** `app/(dashboard)/settings/`
- **Status:** Company settings fully functional, other sub-pages need verification
- **Features:**
  - Company information management
  - Name, address, phone, email
  - Logo URL, timezone, currency
  - Save functionality with toast notifications
  - SUPER_ADMIN only access
- **Sub-pages:** audit-logs, notifications, roles, users
- **API Routes:** `/api/settings/company` exists

## Project Structure

```
hrms/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── _components/      # Dashboard components
│   │   ├── attendance/       # Attendance module
│   │   ├── dashboard/       # Main dashboard
│   │   ├── departments/      # Department management
│   │   ├── documents/        # Document management
│   │   ├── employees/        # Employee management
│   │   ├── leave/            # Leave management
│   │   ├── payroll/          # Payroll management
│   │   ├── performance/     # Performance management
│   │   ├── positions/        # Position management
│   │   ├── recruitment/      # Recruitment module
│   │   ├── reports/          # Reports & analytics
│   │   └── settings/         # System settings
│   ├── api/                  # API routes
│   ├── login/                # Login page
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── components/
│   ├── ui/                   # shadcn/ui components
│   └── theme-provider.tsx    # Theme provider
├── lib/
│   ├── auth.ts               # NextAuth configuration
│   ├── navigation.ts         # Navigation utilities
│   ├── prisma.ts             # Prisma client
│   └── utils.ts              # Utility functions
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Database seeding
├── public/                   # Static assets
└── types/                    # TypeScript type definitions
```

## Authentication System

### Configuration
- **Provider:** Credentials (email/password)
- **Session Strategy:** JWT
- **Session Duration:** 24 hours
- **Password Hashing:** bcryptjs (salt rounds: 10)

### Roles & Permissions
1. **SUPER_ADMINISTRATOR** - Full system access
2. **HR_ADMINISTRATOR** - HR management access
3. **DEPARTMENT_HEAD** - Department level access
4. **EMPLOYEE** - Basic employee access

## Seeded Data

### Users (9 accounts)
- 1 Super Administrator
- 1 HR Administrator
- 1 Department Head
- 6 Regular Employees

### Departments (4)
- Engineering (ENG)
- Human Resources (HR)
- Sales (SAL)
- Marketing (MKT)

### Positions (5)
- Junior Developer
- Mid Developer
- Senior Developer
- HR Manager
- Sales Lead

### Leave Types (3)
- Annual Leave (21 days, carry forward)
- Sick Leave (10 days, no carry forward)
- Unpaid Leave (0 days, no carry forward)

## Current Implementation Status

### ✅ Fully Functional (7 modules)
- **Employee Management** - Complete CRUD with role-based access
- **Department Management** - Complete CRUD with head assignment
- **Attendance Management** - Daily tracking, status marking, holiday integration
- **Leave Management** - Request submission, approval workflow, status filtering
- **Payroll Management** - Complete CRUD with salary management
- **Performance Management** - Review creation, rating system, acknowledgment
- **Recruitment** - Job posting CRUD with applicant tracking

### ⚠️ Partially Functional (2 modules)
- **Dashboard** - UI components implemented, needs API data integration
- **Settings** - Company settings functional, other sub-pages need verification

### 🚧 UI Only / Needs Verification (3 modules)
- **Position Management** - Page exists, implementation not verified
- **Document Management** - Page exists, implementation not verified
- **Reports & Analytics** - Navigation hub exists, individual reports need verification

### ✅ Infrastructure Fully Implemented
- Database schema with all 20+ models
- Authentication system with NextAuth (credentials provider)
- Role-based access control (4 roles with permissions)
- Database seeding with test data (9 users, 4 departments, etc.)
- Complete API route structure (80+ API routes)
- UI component library (shadcn/ui)
- Form validation with react-hook-form and zod
- Toast notifications with sonner
- Responsive design with Tailwind CSS
- Dark mode support with next-themes

## Environment Setup

### Required Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - NextAuth secret key

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema to database
- `npx tsx prisma/seed.ts` - Seed database

## Development Server
- **URL:** http://localhost:3000
- **Login:** /login
- **Dashboard:** /(dashboard)/dashboard

## Notes
- Project uses Next.js 16 with App Router (breaking changes from previous versions)
- PostgreSQL database required
- All passwords are hashed using bcryptjs
- Session timeout set to 24 hours
- Responsive design with Tailwind CSS
- Dark mode support via next-themes
