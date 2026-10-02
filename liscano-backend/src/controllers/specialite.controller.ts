import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/database.js';
import { creerSpecialiteSchema } from '../schemas/mecanicien.schema.js';

// Création d'une spécialité — réservée aux administrateurs
export const creerSpecialite = async (request: FastifyRequest, reply: FastifyReply) => {
  const { nomService, description } = creerSpecialiteSchema.parse(request.body);

  const specialite = await prisma.specialite.create({ data: { nomService, description } });

  return reply.status(201).send({ status: 'success', data: specialite });
};

// Suppression d'une spécialité — réservée aux administrateurs
export const supprimerSpecialite = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };

  await prisma.specialite.delete({ where: { id: Number(id) } });

  return reply.status(204).send();
};
