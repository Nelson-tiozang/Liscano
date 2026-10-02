import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';

import jwtPlugin from './plugins/jwt.plugin.js';
import errorHandlerPlugin from './plugins/error-handler.plugin.js';
import { authRoutes } from './routes/auth.routes.js';
import { mecanicienRoutes } from './routes/mecanicien.routes.js';
import { demandeRoutes } from './routes/demande.routes.js';
import { paiementRoutes } from './routes/paiement.routes.js';
import { avisRoutes } from './routes/avis.routes.js';
import { adminRoutes } from './routes/admin.routes.js';
import prisma from './config/database.js';

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
      process.env.NODE_ENV === 'production'
        ? undefined
        : { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } },
  },
});

async function buildServer() {
  // Plugins transverses (ordre important : erreurs + sécurité d'abord)
  await fastify.register(errorHandlerPlugin);

  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN === '*' ? true : process.env.CORS_ORIGIN?.split(','),
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  await fastify.register(sensible);

  await fastify.register(rateLimit, {
    global: true,
    max: 100, // 100 requêtes...
    timeWindow: '1 minute', // ...par minute et par IP, protection anti-brute-force de base
  });

  await fastify.register(jwtPlugin);

  // Routes
  await fastify.register(authRoutes);
  await fastify.register(mecanicienRoutes);
  await fastify.register(demandeRoutes);
  await fastify.register(paiementRoutes);
  await fastify.register(avisRoutes);
  await fastify.register(adminRoutes);

  fastify.get('/api/sante', async () => ({ status: 'ok', service: 'liscano-backend' }));

  return fastify;
}

const start = async () => {
  try {
    const server = await buildServer();
    const port = Number(process.env.PORT) || 3000;
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Serveur LISCANO connecté à PostgreSQL et prêt sur le port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Arrêt propre : on ferme Fastify puis on coupe la connexion Prisma,
// pour éviter les connexions PostgreSQL orphelines (ex: redéploiement, Ctrl+C).
async function arreterProprement(signal: string) {
  fastify.log.info(`Signal ${signal} reçu, arrêt en cours...`);
  await fastify.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', () => arreterProprement('SIGINT'));
process.on('SIGTERM', () => arreterProprement('SIGTERM'));

start();
