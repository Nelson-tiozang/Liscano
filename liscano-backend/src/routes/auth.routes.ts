import { FastifyInstance } from 'fastify';
import {
  inscrireMecanicien,
  inscrireClient,
  inscrireAdministrateur,
  connecterUtilisateur,
  rafraichirToken,
  obtenirProfil,
} from '../controllers/auth.controller.js';
import { authentifier, autoriser } from '../middlewares/auth.middleware.js';

export async function authRoutes(fastify: FastifyInstance) {
  // Routes publiques
  fastify.post('/api/auth/inscription/mecanicien', inscrireMecanicien);
  fastify.post('/api/auth/inscription/client', inscrireClient);
  fastify.post('/api/auth/connexion', {
    // Anti brute-force : 10 tentatives de connexion max par minute et par IP,
    // en plus de la limite globale de 100 req/min définie dans app.ts.
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
    handler: connecterUtilisateur,
  });
  fastify.post('/api/auth/rafraichir', rafraichirToken);

  // Route protégée : uniquement un administrateur déjà connecté peut en créer un autre.
  // Le tout premier administrateur doit être créé via `npm run seed` (voir prisma/seed.ts).
  fastify.post('/api/auth/inscription/administrateur', {
    preHandler: [authentifier, autoriser('ADMINISTRATEUR')],
    handler: inscrireAdministrateur,
  });

  // Route protégée de test / consultation du profil courant
  fastify.get('/api/auth/moi', {
    preHandler: [authentifier],
    handler: obtenirProfil,
  });
}
