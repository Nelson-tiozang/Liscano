import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

async function errorHandlerPlugin(fastify: FastifyInstance) {
  fastify.setErrorHandler((error: any, request: FastifyRequest, reply: FastifyReply) => {
    // 1. Erreurs de validation Zod
    if (error instanceof ZodError) {
      return reply.status(400).send({
        status: 'error',
        message: 'Données invalides.',
        erreurs: error.issues.map((e) => ({
          champ: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    // 2. Erreurs Prisma connues (contrainte unique, clé étrangère absente, etc.)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const champ = (error.meta?.target as string[] | undefined)?.join(', ') || 'champ';
        return reply.status(409).send({
          status: 'error',
          message: `Une ressource existe déjà avec ce ${champ}.`,
        });
      }
      if (error.code === 'P2025') {
        return reply.status(404).send({
          status: 'error',
          message: 'Ressource introuvable.',
        });
      }
      request.log.error(error);
      return reply.status(400).send({
        status: 'error',
        message: 'Erreur lors de l\'accès aux données.',
      });
    }

    // 3. Erreurs de payload JSON malformé envoyé par le client
    if (error.statusCode === 400 && /json/i.test(error.message || '')) {
      return reply.status(400).send({
        status: 'error',
        message: 'Corps de requête JSON malformé.',
      });
    }

    // 4. Erreurs Fastify avec statusCode déjà défini (ex: validation de schéma Fastify, rate-limit)
    if (error.statusCode && error.statusCode < 500) {
      return reply.status(error.statusCode).send({
        status: 'error',
        message: error.message,
      });
    }

    // 5. Tout le reste : erreur serveur inattendue, on ne fuite pas les détails internes
    request.log.error(error);
    return reply.status(500).send({
      status: 'error',
      message: 'Erreur interne du serveur. Veuillez réessayer plus tard.',
    });
  });

  fastify.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    reply.status(404).send({
      status: 'error',
      message: `Route ${request.method} ${request.url} introuvable.`,
    });
  });
}

export default fp(errorHandlerPlugin, { name: 'error-handler-plugin' });
