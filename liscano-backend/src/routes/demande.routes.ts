import { FastifyInstance } from 'fastify';
import {
  creerDemande,
  listerMesDemandes,
  obtenirDemande,
  accepterDemande,
  refuserDemande,
  demarrerIntervention,
  terminerIntervention,
  annulerDemande,
} from '../controllers/demande.controller.js';
import { authentifier, autoriser } from '../middlewares/auth.middleware.js';

export async function demandeRoutes(fastify: FastifyInstance) {
  fastify.post('/api/demandes', {
    preHandler: [authentifier, autoriser('CLIENT')],
    handler: creerDemande,
  });

  fastify.get('/api/demandes', {
    preHandler: [authentifier, autoriser('CLIENT', 'MECANICIEN')],
    handler: listerMesDemandes,
  });

  fastify.get('/api/demandes/:id', {
    preHandler: [authentifier],
    handler: obtenirDemande,
  });

  fastify.patch('/api/demandes/:id/accepter', {
    preHandler: [authentifier, autoriser('MECANICIEN')],
    handler: accepterDemande,
  });

  fastify.patch('/api/demandes/:id/refuser', {
    preHandler: [authentifier, autoriser('MECANICIEN')],
    handler: refuserDemande,
  });

  fastify.patch('/api/demandes/:id/demarrer', {
    preHandler: [authentifier, autoriser('MECANICIEN')],
    handler: demarrerIntervention,
  });

  fastify.patch('/api/demandes/:id/terminer', {
    preHandler: [authentifier, autoriser('MECANICIEN')],
    handler: terminerIntervention,
  });

  fastify.patch('/api/demandes/:id/annuler', {
    preHandler: [authentifier, autoriser('CLIENT')],
    handler: annulerDemande,
  });
}
