import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/database.js';
import { initierPaiementSchema, simulerWebhookSchema } from '../schemas/paiement.schema.js';
import {
  genererReferenceTransactionMock,
  planifierConfirmationMock,
} from '../services/paiement-mock.service.js';

const TAUX_COMMISSION = Number(process.env.COMMISSION_RATE) || 0.1; // 10% par défaut

// Initie le paiement d'une demande terminée — réservé au client concerné
export const initierPaiement = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id: demandeId } = request.params as { id: string };
  const { modePaiement } = initierPaiementSchema.parse(request.body);
  const clientId = request.utilisateurCourant!.sub;

  const demande = await prisma.demandeDepannage.findUnique({
    where: { id: demandeId },
    include: { paiement: true },
  });

  if (!demande || demande.clientId !== clientId) {
    return reply.status(404).send({ status: 'error', message: 'Demande introuvable.' });
  }
  if (demande.statut !== 'TERMINE') {
    return reply.status(409).send({
      status: 'error',
      message: "Le paiement ne peut être initié qu'une fois l'intervention terminée.",
    });
  }
  if (!demande.prixConvenu) {
    return reply.status(409).send({ status: 'error', message: 'Aucun prix convenu pour cette demande.' });
  }
  if (demande.paiement) {
    return reply.status(409).send({ status: 'error', message: 'Un paiement existe déjà pour cette demande.' });
  }

  const montantTotal = Number(demande.prixConvenu);
  const commissionPlateforme = Math.round(montantTotal * TAUX_COMMISSION * 100) / 100;
  const partMecanicien = Math.round((montantTotal - commissionPlateforme) * 100) / 100;

  // MOBILE_MONEY et ACOMPTE passent par le simulateur asynchrone (comportement d'un vrai
  // provider). CASH est confirmé manuellement par le mécanicien à la remise de l'argent.
  const estElectronique = modePaiement === 'MOBILE_MONEY' || modePaiement === 'ACOMPTE';

  const paiement = await prisma.paiement.create({
    data: {
      demandeId,
      montantTotal,
      commissionPlateforme,
      partMecanicien,
      modePaiement,
      statutPaiement: 'EN_ATTENTE',
      referenceTransaction: estElectronique ? genererReferenceTransactionMock() : null,
    },
  });

  if (estElectronique) {
    planifierConfirmationMock(paiement.id);
  }

  return reply.status(201).send({
    status: 'success',
    message: estElectronique
      ? 'Paiement initié. Confirmation du provider Mobile Money en attente (simulée).'
      : 'Paiement en espèces enregistré, en attente de confirmation par le mécanicien.',
    data: paiement,
  });
};

async function chargerPaiementAutorise(paiementId: string, utilisateurId: string, role: string) {
  const paiement = await prisma.paiement.findUnique({
    where: { id: paiementId },
    include: { demande: true },
  });

  if (!paiement) return { paiement: null, autorise: false };

  const autorise =
    role === 'ADMINISTRATEUR' ||
    paiement.demande.clientId === utilisateurId ||
    paiement.demande.mecanicienId === utilisateurId;

  return { paiement, autorise };
}

// Consultation du statut d'un paiement (polling côté client mobile)
export const obtenirPaiement = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const { sub, role } = request.utilisateurCourant!;

  const { paiement, autorise } = await chargerPaiementAutorise(id, sub, role);

  if (!paiement) {
    return reply.status(404).send({ status: 'error', message: 'Paiement introuvable.' });
  }
  if (!autorise) {
    return reply.status(403).send({ status: 'error', message: 'Accès refusé à ce paiement.' });
  }

  return reply.status(200).send({ status: 'success', data: paiement });
};

// Le mécanicien confirme avoir reçu le paiement en espèces
export const confirmerPaiementCash = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const mecanicienId = request.utilisateurCourant!.sub;

  const paiement = await prisma.paiement.findUnique({ where: { id }, include: { demande: true } });
  if (!paiement || paiement.demande.mecanicienId !== mecanicienId) {
    return reply.status(404).send({ status: 'error', message: 'Paiement introuvable.' });
  }
  if (paiement.modePaiement !== 'CASH') {
    return reply.status(409).send({ status: 'error', message: "Ce paiement n'est pas en espèces." });
  }
  if (paiement.statutPaiement !== 'EN_ATTENTE') {
    return reply.status(409).send({ status: 'error', message: 'Ce paiement a déjà été traité.' });
  }

  const paiementMisAJour = await prisma.paiement.update({
    where: { id },
    data: { statutPaiement: 'PAYE', dateMiseAJourStatut: new Date() },
  });

  return reply.status(200).send({ status: 'success', data: paiementMisAJour });
};

/**
 * Force manuellement l'issue d'un paiement Mobile Money simulé, sans attendre le délai
 * aléatoire du mock. Utile pour les tests (Postman, tests automatisés) et les démos.
 * Désactivé en production — en prod, seul un vrai webhook du provider fait foi.
 */
export const simulerWebhookPaiement = async (request: FastifyRequest, reply: FastifyReply) => {
  if (process.env.NODE_ENV === 'production') {
    return reply.status(403).send({
      status: 'error',
      message: 'Simulation désactivée en production.',
    });
  }

  const { id } = request.params as { id: string };
  const { resultat } = simulerWebhookSchema.parse(request.body);

  const paiement = await prisma.paiement.findUnique({ where: { id } });
  if (!paiement) {
    return reply.status(404).send({ status: 'error', message: 'Paiement introuvable.' });
  }
  if (paiement.statutPaiement !== 'EN_ATTENTE') {
    return reply.status(409).send({ status: 'error', message: 'Ce paiement a déjà été traité.' });
  }

  const paiementMisAJour = await prisma.paiement.update({
    where: { id },
    data: { statutPaiement: resultat, dateMiseAJourStatut: new Date() },
  });

  return reply.status(200).send({ status: 'success', data: paiementMisAJour });
};
