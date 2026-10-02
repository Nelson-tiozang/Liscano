import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/database.js';
import { creerAvisSchema } from '../schemas/avis.schema.js';

// Le client dépose un avis sur une demande terminée ET payée — un seul avis par demande
export const creerAvis = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id: demandeId } = request.params as { id: string };
  const clientId = request.utilisateurCourant!.sub;
  const { note, commentaire } = creerAvisSchema.parse(request.body);

  const demande = await prisma.demandeDepannage.findUnique({
    where: { id: demandeId },
    include: { paiement: true, avis: true },
  });

  if (!demande || demande.clientId !== clientId) {
    return reply.status(404).send({ status: 'error', message: 'Demande introuvable.' });
  }
  if (demande.statut !== 'TERMINE') {
    return reply.status(409).send({
      status: 'error',
      message: "Tu ne peux laisser un avis qu'après une intervention terminée.",
    });
  }
  if (!demande.paiement || demande.paiement.statutPaiement !== 'PAYE') {
    return reply.status(409).send({
      status: 'error',
      message: "Le paiement doit être confirmé avant de pouvoir laisser un avis.",
    });
  }
  if (demande.avis) {
    return reply.status(409).send({ status: 'error', message: 'Un avis existe déjà pour cette demande.' });
  }

  const avis = await prisma.avis.create({ data: { demandeId, note, commentaire } });

  // Recalcule la note moyenne du mécanicien à partir de tous ses avis
  const agregat = await prisma.avis.aggregate({
    where: { demande: { mecanicienId: demande.mecanicienId } },
    _avg: { note: true },
  });

  await prisma.mecanicien.update({
    where: { id: demande.mecanicienId },
    data: { noteMoyenne: agregat._avg.note ?? 5.0 },
  });

  return reply.status(201).send({ status: 'success', data: avis });
};

// Liste publique des avis reçus par un mécanicien
export const listerAvisMecanicien = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id: mecanicienId } = request.params as { id: string };

  const avis = await prisma.avis.findMany({
    where: { demande: { mecanicienId } },
    include: {
      demande: {
        select: {
          client: {
            select: { utilisateur: { select: { prenom: true } } },
          },
        },
      },
    },
    orderBy: { date: 'desc' },
  });

  return reply.status(200).send({ status: 'success', resultats: avis.length, data: avis });
};
