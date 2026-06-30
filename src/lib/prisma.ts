import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Client Prisma en singleton, branché sur le driver adapter node-postgres (Prisma 7).
 *
 * - L'URL de connexion vient de DATABASE_URL (endpoint "pooled" Neon en production).
 * - En développement, Next.js recharge les modules à chaud : sans ce cache global,
 *   on ouvrirait une nouvelle connexion à chaque rechargement (et on épuiserait le pool).
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
