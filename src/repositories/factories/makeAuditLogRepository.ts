import { IAuditLogRepository } from "../IAuditLogRepository";
import { PrismaAuditLogRepository } from "../prisma/PrismaAuditLogRepository";

let auditLogRepo: IAuditLogRepository | null = null;

export function makeAuditLogRepository() {
  if (!auditLogRepo) {
    auditLogRepo = new PrismaAuditLogRepository();
  }
  return auditLogRepo;
}
