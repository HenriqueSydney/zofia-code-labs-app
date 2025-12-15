import { AuditLog, Prisma } from "@/generated/prisma/client";

// Define o tipo da transação (pode ser importado de um local compartilhado)
export type PrismaTransaction = Prisma.TransactionClient;

export interface CreateAuditLogDTO {
  entityType: string; // "Project", "Invoice", "User"
  entityId: string;
  action: string; // "STATUS_CHANGE", "CREATE", "UPDATE"
  userId?: string;
  changes?: Record<string, any>; // O diff (antes/depois)
  metadata?: Record<string, any>; // Contexto (obs, ip, browser)
}

export interface IAuditLogRepository {
  /**
   * Cria um registro de auditoria.
   * Aceita uma transação opcional (tx) para atomicidade.
   */
  create(data: CreateAuditLogDTO, tx?: PrismaTransaction): Promise<AuditLog>;

  /**
   * Busca o histórico de uma entidade específica.
   */
  fetchByEntityId(entityType: string, entityId: string): Promise<AuditLog[]>;
}
