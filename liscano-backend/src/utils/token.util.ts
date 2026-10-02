import { FastifyInstance } from 'fastify';
import type { JwtPayload } from '../types/fastify.js';

const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

/**
 * Émet la paire de jetons (access + refresh) pour un utilisateur donné.
 * Le refresh token porte une durée de vie longue et un claim `type: 'refresh'`
 * distinct, afin qu'il ne puisse jamais être utilisé à la place d'un access token.
 */
export function emettreJetons(
  fastify: FastifyInstance,
  base: Omit<JwtPayload, 'type'>
): { accessToken: string; refreshToken: string } {
  const accessToken = fastify.jwt.sign({ ...base, type: 'access' });
  const refreshToken = fastify.jwt.sign({ ...base, type: 'refresh' }, { expiresIn: REFRESH_EXPIRES_IN });
  return { accessToken, refreshToken };
}

/**
 * Retire le hash du mot de passe (et tout champ sensible futur) avant d'envoyer
 * l'objet utilisateur au client. Ne JAMAIS renvoyer `motDePasse` dans une réponse HTTP.
 */
export function assainirUtilisateur<T extends { motDePasse?: string }>(
  utilisateur: T
): Omit<T, 'motDePasse'> {
  const { motDePasse, ...reste } = utilisateur;
  return reste;
}
