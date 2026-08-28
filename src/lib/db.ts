import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Evita múltiples instancias de Prisma en desarrollo debido al hot reloading.
const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

const getPrismaInstance = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL es obligatoria para conectar con PostgreSQL.");
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma || getPrismaInstance();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
