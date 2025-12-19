import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@/generated/prisma/client";
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

let logLevel: Prisma.LogLevel[] = ["error", "warn"];

if (process.env.NODE_ENV === "test") {
  logLevel = [...logLevel, "info"];
}

if (process.env.NODE_ENV === "development") {
  logLevel = [...logLevel];
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    errorFormat: "pretty",
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
