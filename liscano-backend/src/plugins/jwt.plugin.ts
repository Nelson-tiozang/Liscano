import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { FastifyInstance } from 'fastify';

/**
 * Un seul secret JWT. On distingue les access tokens (courte durée, utilisés
 * pour authentifier chaque requête) des refresh tokens (longue durée, utilisés
 * uniquement pour obtenir un nouvel access token) grâce au claim `type` inclus
 * dans le payload — vérifié explicitement à chaque usage pour empêcher qu'un
 * refresh token soit accepté comme access token, ou inversement.
 */
async function jwtPlugin(fastify: FastifyInstance) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET doit être défini dans le fichier .env');
  }

  await fastify.register(fastifyJwt, {
    secret,
    sign: { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' },
  });
}

export default fp(jwtPlugin, { name: 'jwt-plugin' });
