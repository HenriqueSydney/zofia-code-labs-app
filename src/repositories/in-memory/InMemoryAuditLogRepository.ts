import { randomUUID } from "node:crypto";
import { AuditLog } from "@/generated/prisma/client";
import { date } from "@/lib/dayjs";
import {
  CreateAuditLogDTO,
  IAuditLogRepository,
  PrismaTransaction,
} from "../IAuditLogRepository";

export class InMemoryAuditLogRepository implements IAuditLogRepository {
  public items: AuditLog[] = [];

  async create(
    data: CreateAuditLogDTO,
    _tx?: PrismaTransaction,
  ): Promise<AuditLog> {
    const log: AuditLog = {
      idString: randomUUID(),
      entityType: data.entityType,
      entityId: data.entityId,
      action: data.action,
      changes: data.changes ?? null,
      metadata: data.metadata ?? null,
      userId: data.userId ?? null,
      timestamp: date().toDate(),
    };

    this.items.push(log);
    return log;
  }

  async fetchByEntityId(
    entityType: string,
    entityId: string,
  ): Promise<AuditLog[]> {
    return this.items
      .filter(
        (item) => item.entityType === entityType && item.entityId === entityId,
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}
