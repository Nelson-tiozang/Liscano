import { FastifyInstance } from 'fastify';
import {
  listerUtilisateurs,
  modifierStatutCompte,
  listerDemandesAdmin,
  obtenirStatistiques,
} from '../controllers/admin.controller.js';
import { authentifier, autoriser } from '../middlewares/auth.middleware.js';

export async function adminRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authentifier);
  fastify.addHook('preHandler', autoriser('ADMINISTRATEUR'));

  fastify.get('/api/admin/statistiques', obtenirStatistiques);
  fastify.get('/api/admin/utilisateurs', listerUtilisateurs);
  fastify.patch('/api/admin/utilisateurs/:id/statut', modifierStatutCompte);
  fastify.get('/api/admin/demandes', listerDemandesAdmin);
}
