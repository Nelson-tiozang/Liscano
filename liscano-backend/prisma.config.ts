import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

// On force le chargement du fichier .env
dotenv.config();

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://postgres:azerty@localhost:5432/liscano_db?schema=public",
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});