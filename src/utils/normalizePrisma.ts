import { Decimal } from "@prisma/client/runtime/client";

export function normalizePrisma<T>(value: T): T {
  // Decimal
  if (value instanceof Decimal) {
    return value.toNumber() as T;
  }

  if (value instanceof Date) {
    return value as T; // Mantém como objeto Date válido
    // ou use: return value.toISOString() as T; se quiser converter para string
  }

  // Array
  if (Array.isArray(value)) {
    return value.map(normalizePrisma) as T;
  }

  // Objeto
  if (typeof value === "object" && value !== null) {
    const normalized: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(value)) {
      normalized[key] = normalizePrisma(val);
    }

    return normalized as T;
  }

  // Primitivo
  return value;
}
