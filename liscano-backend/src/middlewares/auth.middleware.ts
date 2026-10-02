import { FastifyRequest, FastifyReply } from 'fastify';
import type { Role } from '../types/fastify.js';

/**
 * preHandler à poser sur toute route protégée.
 * Vérifie le token d'accès (Authorization: Bearer <token>), s'assure qu'il
 * s'agit bien d'un access token (et non d'un refresh token détourné), et
 * attache le payload décodé à `request.utilisateurCourant`.
 */
export async function authentifier(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();

    if (request.user.type !== 'access') {
      return reply.status(401).send({
        status: 'error',
        message: "Ce jeton n'est pas un jeton d'accès valide.",
      });
    }

    request.utilisateurCourant = request.user;
  } catch (error) {
    return reply.status(401).send({
      status: 'error',
      message: "Authentification requise : token d'accès manquant, invalide ou expiré.",
    });
  }
}

/**
 * Factory de preHandler : restreint l'accès à une liste de rôles autorisés.
 * À utiliser APRÈS `authentifier` dans la chaîne de preHandlers.
 *
 * Exemple: { preHandler: [authentifier, autoriser('ADMINISTRATEUR')] }
 */
export function autoriser(...rolesAutorises: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const utilisateur = request.utilisateurCourant;

    if (!utilisateur) {
      return reply.status(401).send({
        status: 'error',
        message: 'Authentification requise avant vérification des droits.',
      });
    }

    if (!rolesAutorises.includes(utilisateur.role)) {
      return reply.status(403).send({
        status: 'error',
        message: "Accès refusé : vous n'avez pas les droits nécessaires pour cette action.",
      });
    }
  };
}
