import { prisma } from "@/lib/prisma"

export interface AuditEntry {
  userId?: string
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, unknown>
  ipAddress?: string
}

export async function logAudit(entry: AuditEntry) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId || null,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId || null,
        details: entry.details as any,
        ipAddress: entry.ipAddress || null,
      },
    })
  } catch (error) {
    console.error("Failed to write audit log:", error)
  }
}
