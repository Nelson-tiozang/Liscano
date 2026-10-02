import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/database.js';
import { assainirUtilisateur } from '../utils/token.util.js';
import {
  listerUtilisateursSchema,
  modifierStatutCompteSchema,
  listerDemandesAdminSchema,
} from '../schemas/admin.schema.js';

const RELATION_PAR_ROLE = {
  CLIENT: { client: { isNot: null } },
  MECANICIEN: { mecanicien: { isNot: null } },
  ADMINISTRATEUR: { administrateur: { isNot: null } },
} as const;

// Liste paginée des utilisateurs, filtrable par rôle
export const listerUtilisateurs = async (request: FastifyRequest, reply: FastifyReply) => {
  const { role, page, limite } = listerUtilisateursSchema.parse(request.query);

  const where = role ? RELATION_PAR_ROLE[role] : {};

  const [utilisateurs, total] = await prisma.$transaction([
    prisma.utilisateur.findMany({
      where,
      include: { client: true, mecanicien: true, administrateur: true },
      orderBy: { dateInscription: 'desc' },
      skip: (page - 1) * limite,
      take: limite,
    }),
    prisma.utilisateur.count({ where }),
  ]);

  return reply.status(200).send({
    status: 'success',
    pagination: { page, limite, total, pages: Math.ceil(total / limite) },
    data: utilisateurs.map(assainirUtilisateur),
  });
};

// Suspend, bannit ou réactive un compte utilisateur
export const modifierStatutCompte = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const { statutCompte } = modifierStatutCompteSchema.parse(request.body);

  // On empêche un admin de se suspendre/bannir lui-même par erreur
  if (id === request.utilisateurCourant!.sub && statutCompte !== 'ACTIF') {
    return reply.status(400).send({
      status: 'error',
      message: 'Tu ne peux pas suspendre ou bannir ton propre compte.',
    });
  }

  const utilisateur = await prisma.utilisateur.update({
    where: { id },
    data: { statutCompte },
  });

  return reply.status(200).send({ status: 'success', data: assainirUtilisateur(utilisateur) });
};

// Liste paginée de toutes les demandes de la plateforme, filtrable par statut
export const listerDemandesAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
  const { statut, page, limite } = listerDemandesAdminSchema.parse(request.query);

  const where = statut ? { statut } : {};

  const [demandes, total] = await prisma.$transaction([
    prisma.demandeDepannage.findMany({
      where,
      include: {
        client: { include: { utilisateur: { select: { nom: true, prenom: true, telephone: true } } } },
        mecanicien: {
          include: { utilisateur: { select: { nom: true, prenom: true, telephone: true } } },
        },
        paiement: true,
        avis: true,
      },
      orderBy: { dateCreation: 'desc' },
      skip: (page - 1) * limite,
      take: limite,
    }),
    prisma.demandeDepannage.count({ where }),
  ]);

  return reply.status(200).send({
    status: 'success',
    pagination: { page, limite, total, pages: Math.ceil(total / limite) },
    data: demandes,
  });
};

// Statistiques globales pour le tableau de bord admin
export const obtenirStatistiques = async (_request: FastifyRequest, reply: FastifyReply) => {
  const [
    totalClients,
    totalMecaniciens,
    mecaniciensDisponibles,
    demandesParStatut,
    revenusAgregat,
  ] = await prisma.$transaction([
    prisma.client.count(),
    prisma.mecanicien.count(),
    prisma.mecanicien.count({ where: { estDisponible: true } }),
    prisma.demandeDepannage.groupBy({ by: ['statut'], _count: { _all: true } }),
    prisma.paiement.aggregate({
      where: { statutPaiement: 'PAYE' },
      _sum: { montantTotal: true, commissionPlateforme: true },
    }),
  ]);

  return reply.status(200).send({
    status: 'success',
    data: {
      totalClients,
      totalMecaniciens,
      mecaniciensDisponibles,
      demandesParStatut: demandesParStatut.reduce(
        (acc, ligne) => ({ ...acc, [ligne.statut]: ligne._count._all }),
        {} as Record<string, number>
      ),
      chiffreAffaireTotal: revenusAgregat._sum.montantTotal ?? 0,
      commissionTotale: revenusAgregat._sum.commissionPlateforme ?? 0,
    },
  });
};
