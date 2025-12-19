import { PrismaClient } from '@prisma/client';

class Database {
  private static instance: PrismaClient;

  private constructor() {};

  public static getInstance(): PrismaClient {
    if (!Database.instance) {
      Database.instance = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
      });
    }
    return Database.instance;
  }
}

export const prismaConnection = Database.getInstance();