import { FastifyInstance } from 'fastify';
import { creerAvis, listerAvisMecanicien } from '../controllers/avis.controller.js';
import { authentifier, autoriser } from '../middlewares/auth.middleware.js';

export async function avisRoutes(fastify: FastifyInstance) {
  fastify.post('/api/demandes/:id/avis', {
    preHandler: [authentifier, autoriser('CLIENT')],
    handler: creerAvis,
  });

  fastify.get('/api/mecaniciens/:id/avis', listerAvisMecanicien);
}
