import { PrismaClient } from "@prisma/client";

import { env } from "./env.js";

let prismaInstance: PrismaClient | null = null;

if (env.DATABASE_URL) {
  try {
    prismaInstance = new PrismaClient();
  } catch {
    prismaInstance = null;
  }
}

export const prisma = prismaInstance;
