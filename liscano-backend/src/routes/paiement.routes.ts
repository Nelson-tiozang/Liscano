import { FastifyInstance } from 'fastify';
import {
  initierPaiement,
  obtenirPaiement,
  confirmerPaiementCash,
  simulerWebhookPaiement,
} from '../controllers/paiement.controller.js';
import { authentifier, autoriser } from '../middlewares/auth.middleware.js';

export async function paiementRoutes(fastify: FastifyInstance) {
  fastify.post('/api/demandes/:id/paiement', {
    preHandler: [authentifier, autoriser('CLIENT')],
    handler: initierPaiement,
  });

  fastify.get('/api/paiements/:id', {
    preHandler: [authentifier],
    handler: obtenirPaiement,
  });

  fastify.patch('/api/paiements/:id/confirmer-cash', {
    preHandler: [authentifier, autoriser('MECANICIEN')],
    handler: confirmerPaiementCash,
  });

  // Route de développement uniquement (voir garde NODE_ENV dans le contrôleur)
  fastify.post('/api/paiements/:id/simuler-webhook', {
    preHandler: [authentifier],
    handler: simulerWebhookPaiement,
  });
}
