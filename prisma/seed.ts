import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { PositionLevel, EmployeeStatus, LeaveStatus, AttendanceStatus, JobStatus, ApplicantStatus } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  const hashedPassword = await bcrypt.hash('AdminPass123!', 10)

  // Create Roles
  console.log('📋 Creating roles...')
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMINISTRATOR' },
    update: {},
    create: { name: 'SUPER_ADMINISTRATOR', description: 'Full system access' }
  })

  const hrAdminRole = await prisma.role.upsert({
    where: { name: 'HR_ADMINISTRATOR' },
    update: {},
    create: { name: 'HR_ADMINISTRATOR', description: 'HR management access' }
  })

  const deptHeadRole = await prisma.role.upsert({
    where: { name: 'DEPARTMENT_HEAD' },
    update: {},
    create: { name: 'DEPARTMENT_HEAD', description: 'Department level access' }
  })

  const employeeRole = await prisma.role.upsert({
    where: { name: 'EMPLOYEE' },
    update: {},
    create: { name: 'EMPLOYEE', description: 'Basic employee access' }
  })

  // Create Permissions
  console.log('🔐 Creating permissions...')
  const permissions = [
    { name: 'View Employees', resource: 'employees', action: 'read' },
    { name: 'Create Employees', resource: 'employees', action: 'create' },
    { name: 'Update Employees', resource: 'employees', action: 'update' },
    { name: 'Delete Employees', resource: 'employees', action: 'delete' },
    { name: 'View Departments', resource: 'departments', action: 'read' },
    { name: 'Manage Departments', resource: 'departments', action: 'manage' },
    { name: 'View Payroll', resource: 'payroll', action: 'read' },
    { name: 'Manage Payroll', resource: 'payroll', action: 'manage' },
    { name: 'View Attendance', resource: 'attendance', action: 'read' },
    { name: 'Manage Attendance', resource: 'attendance', action: 'manage' }
  ]

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { resource_action: { resource: perm.resource, action: perm.action } },
      update: {},
      create: perm
    })
  }

  // Assign permissions to Super Admin
  const allPermissions = await prisma.permission.findMany()
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: superAdminRole.id, permissionId: perm.id }
    })
  }

  // Assign HR permissions to HR Admin
  const hrPermissions = await prisma.permission.findMany({
    where: { resource: { in: ['employees', 'departments', 'payroll', 'attendance'] } }
  })
  for (const perm of hrPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: hrAdminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: hrAdminRole.id, permissionId: perm.id }
    })
  }

  // Create Super Admin User
  console.log('👤 Creating admin user...')
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      email: 'admin@company.com',
      password: hashedPassword,
      roleId: superAdminRole.id,
      emailVerified: new Date()
    }
  })

  // Create Departments
  console.log('🏢 Creating departments...')
  const engineeringDept = await prisma.department.upsert({
    where: { code: 'ENG' },
    update: {},
    create: { name: 'Engineering', code: 'ENG', description: 'Software development team' }
  })

  const hrDept = await prisma.department.upsert({
    where: { code: 'HR' },
    update: {},
    create: { name: 'Human Resources', code: 'HR', description: 'HR management team' }
  })

  const salesDept = await prisma.department.upsert({
    where: { code: 'SAL' },
    update: {},
    create: { name: 'Sales', code: 'SAL', description: 'Sales and marketing team' }
  })

  const marketingDept = await prisma.department.upsert({
    where: { code: 'MKT' },
    update: {},
    create: { name: 'Marketing', code: 'MKT', description: 'Marketing and branding team' }
  })

  // Create Positions
  console.log('💼 Creating positions...')
  const positions = [
    { title: "Junior Developer", departmentId: engineeringDept.id, level: PositionLevel.JUNIOR },
    { title: "Mid Developer", departmentId: engineeringDept.id, level: PositionLevel.MID },
    { title: "Senior Developer", departmentId: engineeringDept.id, level: PositionLevel.SENIOR },
    { title: "HR Manager", departmentId: hrDept.id, level: PositionLevel.LEAD },
    { title: "Sales Lead", departmentId: salesDept.id, level: PositionLevel.LEAD },
  ]

  const createdPositions = []
  for (const pos of positions) {
    const created = await prisma.position.upsert({
      where: { title: pos.title },
      update: {},
      create: pos
    })
    createdPositions.push(created)
  }

  // Create Employees
  console.log('👥 Creating employees...')
  const employees = [
    {
      user: { email: 'john.doe@company.com', password: await bcrypt.hash('Password123!', 10), roleId: employeeRole.id },
      employeeCode: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      departmentId: engineeringDept.id,
      positionId: createdPositions[0].id,
      status: EmployeeStatus.ACTIVE,
      profile: { phone: '+1234567890', address: '123 Main St', emergencyContact: 'Jane Doe' }
    },
    {
      user: { email: 'jane.smith@company.com', password: await bcrypt.hash('Password123!', 10), roleId: deptHeadRole.id },
      employeeCode: 'EMP002',
      firstName: 'Jane',
      lastName: 'Smith',
      departmentId: engineeringDept.id,
      positionId: createdPositions[2].id,
      status: EmployeeStatus.ACTIVE,
      profile: { phone: '+1234567891', address: '456 Oak Ave', emergencyContact: 'John Smith' }
    },
    {
      user: { email: 'mike.johnson@company.com', password: await bcrypt.hash('Password123!', 10), roleId: employeeRole.id },
      employeeCode: 'EMP003',
      firstName: 'Mike',
      lastName: 'Johnson',
      departmentId: hrDept.id,
      positionId: createdPositions[3].id,
      status: EmployeeStatus.ON_LEAVE,
      profile: { phone: '+1234567892', address: '789 Pine Rd', emergencyContact: 'Sarah Johnson' }
    },
    {
      user: { email: 'sarah.williams@company.com', password: await bcrypt.hash('Password123!', 10), roleId: hrAdminRole.id },
      employeeCode: 'EMP004',
      firstName: 'Sarah',
      lastName: 'Williams',
      departmentId: hrDept.id,
      positionId: createdPositions[3].id,
      status: EmployeeStatus.ACTIVE,
      profile: { phone: '+1234567893', address: '321 Elm St', emergencyContact: 'Tom Williams' }
    },
    {
      user: { email: 'tom.brown@company.com', password: await bcrypt.hash('Password123!', 10), roleId: employeeRole.id },
      employeeCode: 'EMP005',
      firstName: 'Tom',
      lastName: 'Brown',
      departmentId: salesDept.id,
      positionId: createdPositions[4].id,
      status: EmployeeStatus.PROBATION,
      profile: { phone: '+1234567894', address: '654 Maple Dr', emergencyContact: 'Lisa Brown' }
    },
    {
      user: { email: 'lisa.davis@company.com', password: await bcrypt.hash('Password123!', 10), roleId: employeeRole.id },
      employeeCode: 'EMP006',
      firstName: 'Lisa',
      lastName: 'Davis',
      departmentId: engineeringDept.id,
      positionId: createdPositions[1].id,
      status: EmployeeStatus.ACTIVE,
      profile: { phone: '+1234567895', address: '987 Cedar Ln', emergencyContact: 'Bob Davis' }
    },
    {
      user: { email: 'bob.miller@company.com', password: await bcrypt.hash('Password123!', 10), roleId: employeeRole.id },
      employeeCode: 'EMP007',
      firstName: 'Bob',
      lastName: 'Miller',
      departmentId: marketingDept.id,
      positionId: createdPositions[4].id,
      status: EmployeeStatus.ACTIVE,
      profile: { phone: '+1234567896', address: '147 Birch Blvd', emergencyContact: 'Amy Miller' }
    },
    {
      user: { email: 'amy.wilson@company.com', password: await bcrypt.hash('Password123!', 10), roleId: employeeRole.id },
      employeeCode: 'EMP008',
      firstName: 'Amy',
      lastName: 'Wilson',
      departmentId: salesDept.id,
      positionId: createdPositions[4].id,
      status: EmployeeStatus.ACTIVE,
      profile: { phone: '+1234567897', address: '258 Spruce Way', emergencyContact: 'Chris Wilson' }
    }
  ]

  const createdEmployees = []
  for (const emp of employees) {
    const user = await prisma.user.upsert({
      where: { email: emp.user.email },
      update: {},
      create: emp.user
    })

    const employee = await prisma.employee.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        employeeCode: emp.employeeCode,
        firstName: emp.firstName,
        lastName: emp.lastName,
        departmentId: emp.departmentId,
        positionId: emp.positionId,
        hireDate: new Date('2023-01-15'),
        status: emp.status
      }
    })

    await prisma.employeeProfile.upsert({
      where: { employeeId: employee.id },
      update: {},
      create: {
        employeeId: employee.id,
        ...emp.profile
      }
    })

    createdEmployees.push(employee)
  }

  // Create Leave Types
  console.log('🏖️ Creating leave types...')
  const annualLeave = await prisma.leaveType.upsert({
    where: { name: 'Annual Leave' },
    update: {},
    create: { name: 'Annual Leave', daysAllowed: 21, carryForward: true }
  })

  const sickLeave = await prisma.leaveType.upsert({
    where: { name: 'Sick Leave' },
    update: {},
    create: { name: 'Sick Leave', daysAllowed: 10, carryForward: false }
  })

  const unpaidLeave = await prisma.leaveType.upsert({
    where: { name: 'Unpaid Leave' },
    update: {},
    create: { name: 'Unpaid Leave', daysAllowed: 0, carryForward: false }
  })

  // Create Leave Requests
  console.log('📝 Creating leave requests...')
  await prisma.leaveRequest.create({
    data: {
      employeeId: createdEmployees[0].id,
      leaveTypeId: annualLeave.id,
      startDate: new Date('2024-08-01'),
      endDate: new Date('2024-08-05'),
      reason: 'Family vacation',
      status: LeaveStatus.APPROVED
    }
  })

  await prisma.leaveRequest.create({
    data: {
      employeeId: createdEmployees[1].id,
      leaveTypeId: sickLeave.id,
      startDate: new Date('2024-07-20'),
      endDate: new Date('2024-07-22'),
      reason: 'Medical appointment',
      status: LeaveStatus.PENDING
    }
  })

  // Create Attendance Records
  console.log('⏰ Creating attendance records...')
  const today = new Date()
  for (let i = 0; i < 5; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    
    for (const emp of createdEmployees.slice(0, 5)) {
      const checkIn = new Date(date)
      checkIn.setHours(9, 0, 0, 0)
      const checkOut = new Date(date)
      checkOut.setHours(17, 30, 0, 0)
      
      await prisma.attendance.upsert({
        where: { employeeId_date: { employeeId: emp.id, date } },
        update: {},
        create: {
          employeeId: emp.id,
          date,
          checkIn,
          checkOut,
          status: i === 0 ? AttendanceStatus.LATE : AttendanceStatus.PRESENT,
          overtimeHours: i === 0 ? 0 : 1.5
        }
      })
    }
  }

  // Create Holidays
  console.log('🎉 Creating holidays...')
  await prisma.holiday.upsert({
    where: { date: new Date('2024-07-04') },
    update: {},
    create: { name: 'Independence Day', date: new Date('2024-07-04'), type: 'PUBLIC' }
  })

  await prisma.holiday.upsert({
    where: { date: new Date('2024-07-15') },
    update: {},
    create: { name: 'Company Anniversary', date: new Date('2024-07-15'), type: 'COMPANY' }
  })

  // Create Recruitment Jobs
  console.log('💼 Creating job postings...')
  const devJob = await prisma.recruitmentJob.upsert({
    where: { title: 'Senior Full Stack Developer' },
    update: {},
    create: {
      title: 'Senior Full Stack Developer',
      departmentId: engineeringDept.id,
      description: 'We are looking for an experienced full stack developer...',
      requirements: '5+ years experience with React, Node.js, and PostgreSQL',
      status: JobStatus.OPEN,
      postedAt: new Date('2024-06-01')
    }
  })

  const designerJob = await prisma.recruitmentJob.upsert({
    where: { title: 'UI/UX Designer' },
    update: {},
    create: {
      title: 'UI/UX Designer',
      departmentId: marketingDept.id,
      description: 'Join our creative team as a UI/UX designer...',
      requirements: '3+ years experience with Figma and modern design tools',
      status: JobStatus.CLOSED,
      postedAt: new Date('2024-05-01'),
      closedAt: new Date('2024-06-15')
    }
  })

  // Create Applicants
  console.log('📄 Creating applicants...')
  await prisma.applicant.create({
    data: {
      jobId: devJob.id,
      firstName: 'Alex',
      lastName: 'Thompson',
      email: 'alex.thompson@email.com',
      phone: '+1234567899',
      resumeUrl: 'https://example.com/resume/alex.pdf',
      status: ApplicantStatus.INTERVIEW
    }
  })

  await prisma.applicant.create({
    data: {
      jobId: devJob.id,
      firstName: 'Rachel',
      lastName: 'Green',
      email: 'rachel.green@email.com',
      phone: '+1234567900',
      resumeUrl: 'https://example.com/resume/rachel.pdf',
      status: ApplicantStatus.SCREENING
    }
  })

  await prisma.applicant.create({
    data: {
      jobId: designerJob.id,
      firstName: 'David',
      lastName: 'Chen',
      email: 'david.chen@email.com',
      phone: '+1234567901',
      resumeUrl: 'https://example.com/resume/david.pdf',
      status: ApplicantStatus.HIRED
    }
  })

  // Create Announcements
  console.log('📢 Creating announcements...')
  await prisma.announcement.create({
    data: {
      title: 'Q3 Goals Meeting',
      content: 'All employees are required to attend the Q3 goals meeting on July 25th at 10 AM in the main conference room.',
      authorId: adminUser.id,
      priority: 'HIGH',
      expiresAt: new Date('2024-07-26')
    }
  })

  await prisma.announcement.create({
    data: {
      title: 'New Health Benefits',
      content: 'We are excited to announce enhanced health benefits starting next month. Details will be shared via email.',
      authorId: adminUser.id,
      priority: 'NORMAL'
    }
  })

  // Create Company Settings
  console.log('⚙️ Creating company settings...')
  await prisma.companySetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      companyName: 'TechCorp Inc.',
      address: '123 Business Park, Suite 100, San Francisco, CA 94105',
      phone: '+1-555-0123',
      email: 'info@techcorp.com',
      logoUrl: 'https://example.com/logo.png',
      timezone: 'America/Los_Angeles',
      currency: 'USD'
    }
  })

  console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })