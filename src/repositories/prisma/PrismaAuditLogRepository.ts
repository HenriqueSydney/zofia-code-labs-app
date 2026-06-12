// src/repositories/prisma/PrismaAuditRepository.ts

import { prisma } from "@/lib/prisma";
import { AuditLog, Prisma } from "@/generated/prisma/client";
import {
  IAuditLogRepository,
  CreateAuditLogDTO,
  PrismaTransaction,
} from "../IAuditLogRepository";
import { sanitizeAuditUserId } from "@/constants/systemActors";
import { normalizePrisma } from "@/utils/normalizePrisma"; // Se você usar aquele helper

export class PrismaAuditLogRepository implements IAuditLogRepository {
  async create(
    { changes, metadata, userId, ...rest }: CreateAuditLogDTO,
    tx?: PrismaTransaction
  ): Promise<AuditLog> {
    // Se a transação (tx) foi passada, usa ela. Se não, usa o client global.
    const client = tx || prisma;

    const { userId: auditUserId, actor } = sanitizeAuditUserId(userId);
    const auditMetadata =
      actor !== undefined
        ? { ...(metadata ?? {}), actor }
        : (metadata ?? undefined);

    const log = await client.auditLog.create({
      data: {
        ...rest,
        userId: auditUserId,
        // O Prisma lida bem com objetos JS direto para campos Json,
        // mas as vezes precisamos garantir que não seja undefined
        changes: changes ?? Prisma.DbNull,
        metadata: auditMetadata ?? Prisma.DbNull,
      },
    });

    return normalizePrisma(log);
  }

  async fetchByEntityId(
    entityType: string,
    entityId: string
  ): Promise<AuditLog[]> {
    const logs = await prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true, // Útil para mostrar o avatar na timeline
          },
        },
      },
      orderBy: {
        timestamp: "desc", // Do mais recente para o mais antigo
      },
    });

    return normalizePrisma(logs);
  }
}
