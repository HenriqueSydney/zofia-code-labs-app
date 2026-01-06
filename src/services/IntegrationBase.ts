import { apiLogger } from "@/lib/logger";

// Base para TODAS as integrações
export abstract class IntegrationBase {
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }

  // Método obrigatório para todas as filhas
  abstract healthCheck(): Promise<{ status: "up" | "down"; latency: number }>;

  // Método compartilhado (opcional)
  protected logAction(action: string) {
    apiLogger.info(
      `[${this.name}] Action: ${action} at ${new Date().toISOString()}`
    );
  }
}
