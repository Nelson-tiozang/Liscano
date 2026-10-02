import { FastifyInstance } from 'fastify';
import {
  listerMecaniciensProches,
  obtenirMecanicien,
  obtenirMonProfilMecanicien,
  mettreAJourPosition,
  mettreAJourDisponibilite,
  ajouterSpecialites,
  retirerSpecialite,
  listerSpecialites,
} from '../controllers/mecanicien.controller.js';
import { creerSpecialite, supprimerSpecialite } from '../controllers/specialite.controller.js';
import { authentifier, autoriser } from '../middlewares/auth.middleware.js';

export async function mecanicienRoutes(fastify: FastifyInstance) {
  // --- Public ---
  fastify.get('/api/mecaniciens/proches', listerMecaniciensProches);
  fastify.get('/api/specialites', listerSpecialites);
  fastify.get('/api/mecaniciens/:id', obtenirMecanicien);

  // --- Protégé : mécanicien connecté gérant son propre profil ---
  fastify.get('/api/mecaniciens/moi/profil', {
    preHandler: [authentifier, autoriser('MECANICIEN')],
    handler: obtenirMonProfilMecanicien,
  });

  fastify.patch('/api/mecaniciens/moi/position', {
    preHandler: [authentifier, autoriser('MECANICIEN')],
    handler: mettreAJourPosition,
  });

  fastify.patch('/api/mecaniciens/moi/disponibilite', {
    preHandler: [authentifier, autoriser('MECANICIEN')],
    handler: mettreAJourDisponibilite,
  });

  fastify.post('/api/mecaniciens/moi/specialites', {
    preHandler: [authentifier, autoriser('MECANICIEN')],
    handler: ajouterSpecialites,
  });

  fastify.delete('/api/mecaniciens/moi/specialites/:specialiteId', {
    preHandler: [authentifier, autoriser('MECANICIEN')],
    handler: retirerSpecialite,
  });

  // --- Protégé : administration du référentiel des spécialités ---
  fastify.post('/api/specialites', {
    preHandler: [authentifier, autoriser('ADMINISTRATEUR')],
    handler: creerSpecialite,
  });

  fastify.delete('/api/specialites/:id', {
    preHandler: [authentifier, autoriser('ADMINISTRATEUR')],
    handler: supprimerSpecialite,
  });
}
