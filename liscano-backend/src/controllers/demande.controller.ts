import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/database.js';
import {
  creerDemandeSchema,
  annulerDemandeSchema,
  terminerInterventionSchema,
} from '../schemas/demande.schema.js';

const INCLUSIONS_DEMANDE = {
  client: { include: { utilisateur: { select: { nom: true, prenom: true, telephone: true } } } },
  mecanicien: {
    include: { utilisateur: { select: { nom: true, prenom: true, telephone: true } } },
  },
  paiement: true,
  avis: true,
} as const;

// Création d'une demande de dépannage — réservée aux clients
export const creerDemande = async (request: FastifyRequest, reply: FastifyReply) => {
  const { mecanicienId, latitudePanne, longitudePanne, descriptionPanne } =
    creerDemandeSchema.parse(request.body);
  const clientId = request.utilisateurCourant!.sub;

  const mecanicien = await prisma.mecanicien.findUnique({ where: { id: mecanicienId } });
  if (!mecanicien) {
    return reply.status(404).send({ status: 'error', message: 'Mécanicien introuvable.' });
  }
  if (!mecanicien.estDisponible) {
    return reply.status(409).send({
      status: 'error',
      message: "Ce mécanicien n'est plus disponible actuellement. Choisis-en un autre.",
    });
  }

  const demande = await prisma.demandeDepannage.create({
    data: { clientId, mecanicienId, latitudePanne, longitudePanne, descriptionPanne },
    include: INCLUSIONS_DEMANDE,
  });

  return reply.status(201).send({ status: 'success', data: demande });
};

// Liste des demandes de l'utilisateur connecté (côté client OU côté mécanicien selon son rôle)
export const listerMesDemandes = async (request: FastifyRequest, reply: FastifyReply) => {
  const { sub, role } = request.utilisateurCourant!;
  const { statut } = request.query as { statut?: string };

  const where =
    role === 'MECANICIEN'
      ? { mecanicienId: sub, ...(statut ? { statut: statut as any } : {}) }
      : { clientId: sub, ...(statut ? { statut: statut as any } : {}) };

  const demandes = await prisma.demandeDepannage.findMany({
    where,
    include: INCLUSIONS_DEMANDE,
    orderBy: { dateCreation: 'desc' },
  });

  return reply.status(200).send({ status: 'success', resultats: demandes.length, data: demandes });
};

async function chargerDemandeAutorisee(demandeId: string, utilisateurId: string, role: string) {
  const demande = await prisma.demandeDepannage.findUnique({
    where: { id: demandeId },
    include: INCLUSIONS_DEMANDE,
  });

  if (!demande) return { demande: null, autorise: false };

  const autorise =
    role === 'ADMINISTRATEUR' || demande.clientId === utilisateurId || demande.mecanicienId === utilisateurId;

  return { demande, autorise };
}

// Détail d'une demande — visible par le client concerné, le mécanicien concerné, ou un admin
export const obtenirDemande = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const { sub, role } = request.utilisateurCourant!;

  const { demande, autorise } = await chargerDemandeAutorisee(id, sub, role);

  if (!demande) {
    return reply.status(404).send({ status: 'error', message: 'Demande introuvable.' });
  }
  if (!autorise) {
    return reply.status(403).send({ status: 'error', message: 'Accès refusé à cette demande.' });
  }

  return reply.status(200).send({ status: 'success', data: demande });
};

// Le mécanicien accepte la demande : EN_ATTENTE -> ACCEPTE, et devient indisponible pour de nouvelles demandes
export const accepterDemande = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const mecanicienId = request.utilisateurCourant!.sub;

  const demande = await prisma.demandeDepannage.findUnique({ where: { id } });
  if (!demande || demande.mecanicienId !== mecanicienId) {
    return reply.status(404).send({ status: 'error', message: 'Demande introuvable.' });
  }
  if (demande.statut !== 'EN_ATTENTE') {
    return reply.status(409).send({
      status: 'error',
      message: `Impossible d'accepter une demande au statut ${demande.statut}.`,
    });
  }

  const [demandeMiseAJour] = await prisma.$transaction([
    prisma.demandeDepannage.update({
      where: { id },
      data: { statut: 'ACCEPTE', dateAcceptation: new Date() },
      include: INCLUSIONS_DEMANDE,
    }),
    prisma.mecanicien.update({ where: { id: mecanicienId }, data: { estDisponible: false } }),
  ]);

  return reply.status(200).send({ status: 'success', data: demandeMiseAJour });
};

// Le mécanicien refuse la demande : EN_ATTENTE -> ANNULE
export const refuserDemande = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const mecanicienId = request.utilisateurCourant!.sub;
  const { motif } = annulerDemandeSchema.parse(request.body ?? {});

  const demande = await prisma.demandeDepannage.findUnique({ where: { id } });
  if (!demande || demande.mecanicienId !== mecanicienId) {
    return reply.status(404).send({ status: 'error', message: 'Demande introuvable.' });
  }
  if (demande.statut !== 'EN_ATTENTE') {
    return reply.status(409).send({
      status: 'error',
      message: `Impossible de refuser une demande au statut ${demande.statut}.`,
    });
  }

  const demandeMiseAJour = await prisma.demandeDepannage.update({
    where: { id },
    data: { statut: 'ANNULE', motifAnnulation: motif ?? 'Refusée par le mécanicien.' },
    include: INCLUSIONS_DEMANDE,
  });

  return reply.status(200).send({ status: 'success', data: demandeMiseAJour });
};

// Le mécanicien démarre l'intervention (arrivé sur place) : ACCEPTE -> EN_COURS
export const demarrerIntervention = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const mecanicienId = request.utilisateurCourant!.sub;

  const demande = await prisma.demandeDepannage.findUnique({ where: { id } });
  if (!demande || demande.mecanicienId !== mecanicienId) {
    return reply.status(404).send({ status: 'error', message: 'Demande introuvable.' });
  }
  if (demande.statut !== 'ACCEPTE') {
    return reply.status(409).send({
      status: 'error',
      message: `Impossible de démarrer une intervention au statut ${demande.statut}.`,
    });
  }

  const demandeMiseAJour = await prisma.demandeDepannage.update({
    where: { id },
    data: { statut: 'EN_COURS', dateDebut: new Date() },
    include: INCLUSIONS_DEMANDE,
  });

  return reply.status(200).send({ status: 'success', data: demandeMiseAJour });
};

// Le mécanicien termine l'intervention et fixe le prix convenu : EN_COURS -> TERMINE
// Rend aussi le mécanicien de nouveau disponible pour de nouvelles demandes.
export const terminerIntervention = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const mecanicienId = request.utilisateurCourant!.sub;
  const { prixConvenu } = terminerInterventionSchema.parse(request.body);

  const demande = await prisma.demandeDepannage.findUnique({ where: { id } });
  if (!demande || demande.mecanicienId !== mecanicienId) {
    return reply.status(404).send({ status: 'error', message: 'Demande introuvable.' });
  }
  if (demande.statut !== 'EN_COURS') {
    return reply.status(409).send({
      status: 'error',
      message: `Impossible de terminer une intervention au statut ${demande.statut}.`,
    });
  }

  const [demandeMiseAJour] = await prisma.$transaction([
    prisma.demandeDepannage.update({
      where: { id },
      data: { statut: 'TERMINE', dateFin: new Date(), prixConvenu },
      include: INCLUSIONS_DEMANDE,
    }),
    prisma.mecanicien.update({ where: { id: mecanicienId }, data: { estDisponible: true } }),
  ]);

  return reply.status(200).send({ status: 'success', data: demandeMiseAJour });
};

// Le client annule sa demande tant qu'elle n'a pas encore été acceptée : EN_ATTENTE -> ANNULE
export const annulerDemande = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const clientId = request.utilisateurCourant!.sub;
  const { motif } = annulerDemandeSchema.parse(request.body ?? {});

  const demande = await prisma.demandeDepannage.findUnique({ where: { id } });
  if (!demande || demande.clientId !== clientId) {
    return reply.status(404).send({ status: 'error', message: 'Demande introuvable.' });
  }
  if (demande.statut !== 'EN_ATTENTE') {
    return reply.status(409).send({
      status: 'error',
      message: `Cette demande ne peut plus être annulée (statut ${demande.statut}). Contacte le mécanicien directement.`,
    });
  }

  const demandeMiseAJour = await prisma.demandeDepannage.update({
    where: { id },
    data: { statut: 'ANNULE', motifAnnulation: motif ?? 'Annulée par le client.' },
    include: INCLUSIONS_DEMANDE,
  });

  return reply.status(200).send({ status: 'success', data: demandeMiseAJour });
};
