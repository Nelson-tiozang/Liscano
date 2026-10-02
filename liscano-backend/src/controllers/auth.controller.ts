import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/database.js';
import { hacherMotDePasse, verifierMotDePasse } from '../utils/password.util.js';
import { emettreJetons, assainirUtilisateur } from '../utils/token.util.js';
import { encoderGeohash } from '../utils/geohash.util.js';
import {
  inscriptionClientSchema,
  inscriptionMecanicienSchema,
  inscriptionAdministrateurSchema,
  connexionSchema,
  rafraichirTokenSchema,
} from '../schemas/auth.schema.js';
import type { Role } from '../types/fastify.js';

/**
 * Détermine le rôle applicatif d'un utilisateur à partir des relations
 * d'héritage simulées (client / mecanicien / administrateur).
 */
function determinerRole(utilisateur: {
  client?: unknown;
  mecanicien?: unknown;
  administrateur?: unknown;
}): Role {
  if (utilisateur.administrateur) return 'ADMINISTRATEUR';
  if (utilisateur.mecanicien) return 'MECANICIEN';
  return 'CLIENT';
}

// 1. Inscription d'un mécanicien (publique)
export const inscrireMecanicien = async (request: FastifyRequest, reply: FastifyReply) => {
  const { nom, prenom, telephone, motDePasse, nomGarage, latitude, longitude } =
    inscriptionMecanicienSchema.parse(request.body);

  const motDePasseHache = await hacherMotDePasse(motDePasse);
  const geohash = encoderGeohash(latitude, longitude);

  const nouveauMeca = await prisma.utilisateur.create({
    data: {
      nom,
      prenom,
      telephone,
      motDePasse: motDePasseHache,
      mecanicien: {
        create: { nomGarage, latitude, longitude, geohash },
      },
    },
    include: { mecanicien: true },
  });

  const { accessToken, refreshToken } = emettreJetons(request.server, {
    sub: nouveauMeca.id,
    telephone: nouveauMeca.telephone,
    role: 'MECANICIEN',
  });

  return reply.status(201).send({
    status: 'success',
    message: 'Compte mécanicien créé avec succès.',
    data: assainirUtilisateur(nouveauMeca),
    accessToken,
    refreshToken,
  });
};

// 2. Inscription d'un client (publique)
export const inscrireClient = async (request: FastifyRequest, reply: FastifyReply) => {
  const { nom, prenom, telephone, motDePasse } = inscriptionClientSchema.parse(request.body);

  const motDePasseHache = await hacherMotDePasse(motDePasse);

  const nouveauClient = await prisma.utilisateur.create({
    data: {
      nom,
      prenom,
      telephone,
      motDePasse: motDePasseHache,
      client: { create: {} },
    },
    include: { client: true },
  });

  const { accessToken, refreshToken } = emettreJetons(request.server, {
    sub: nouveauClient.id,
    telephone: nouveauClient.telephone,
    role: 'CLIENT',
  });

  return reply.status(201).send({
    status: 'success',
    message: 'Compte client créé avec succès.',
    data: assainirUtilisateur(nouveauClient),
    accessToken,
    refreshToken,
  });
};

// 3. Inscription d'un administrateur — JAMAIS publique.
// Protégée en amont par [authentifier, autoriser('ADMINISTRATEUR')] dans les routes,
// à l'exception du tout premier admin qui doit être créé via `npm run seed`.
export const inscrireAdministrateur = async (request: FastifyRequest, reply: FastifyReply) => {
  const { nom, prenom, telephone, motDePasse, niveauAcces } =
    inscriptionAdministrateurSchema.parse(request.body);

  const motDePasseHache = await hacherMotDePasse(motDePasse);

  const nouvelAdmin = await prisma.utilisateur.create({
    data: {
      nom,
      prenom,
      telephone,
      motDePasse: motDePasseHache,
      administrateur: {
        create: { niveauAcces: niveauAcces || 'SUPER_ADMIN' },
      },
    },
    include: { administrateur: true },
  });

  return reply.status(201).send({
    status: 'success',
    message: 'Compte administrateur créé avec succès.',
    data: assainirUtilisateur(nouvelAdmin),
  });
};

// 4. Connexion (publique)
export const connecterUtilisateur = async (request: FastifyRequest, reply: FastifyReply) => {
  const { telephone, motDePasse } = connexionSchema.parse(request.body);

  const utilisateur = await prisma.utilisateur.findUnique({
    where: { telephone },
    include: { client: true, mecanicien: true, administrateur: true },
  });

  // Message volontairement générique (identifiants invalides) pour ne pas
  // révéler si c'est le numéro ou le mot de passe qui est incorrect.
  if (!utilisateur) {
    return reply.status(401).send({ status: 'error', message: 'Identifiants invalides.' });
  }

  const motDePasseValide = await verifierMotDePasse(motDePasse, utilisateur.motDePasse);
  if (!motDePasseValide) {
    return reply.status(401).send({ status: 'error', message: 'Identifiants invalides.' });
  }

  if (utilisateur.statutCompte !== 'ACTIF') {
    return reply.status(403).send({
      status: 'error',
      message: `Compte ${utilisateur.statutCompte.toLowerCase()}. Contactez le support.`,
    });
  }

  const role = determinerRole(utilisateur);

  const { accessToken, refreshToken } = emettreJetons(request.server, {
    sub: utilisateur.id,
    telephone: utilisateur.telephone,
    role,
  });

  return reply.status(200).send({
    status: 'success',
    message: 'Connexion réussie.',
    role,
    data: assainirUtilisateur(utilisateur),
    accessToken,
    refreshToken,
  });
};

// 5. Rafraîchissement de l'access token à partir d'un refresh token valide
export const rafraichirToken = async (request: FastifyRequest, reply: FastifyReply) => {
  const { refreshToken } = rafraichirTokenSchema.parse(request.body);

  let payload: any;
  try {
    payload = request.server.jwt.verify(refreshToken);
  } catch {
    return reply.status(401).send({
      status: 'error',
      message: 'Refresh token invalide ou expiré. Veuillez vous reconnecter.',
    });
  }

  if (payload.type !== 'refresh') {
    return reply.status(401).send({ status: 'error', message: "Ce jeton n'est pas un refresh token." });
  }

  // On revérifie que l'utilisateur existe toujours et est actif avant de réémettre un access token.
  const utilisateur = await prisma.utilisateur.findUnique({ where: { id: payload.sub } });
  if (!utilisateur || utilisateur.statutCompte !== 'ACTIF') {
    return reply.status(401).send({ status: 'error', message: 'Compte introuvable ou inactif.' });
  }

  const { accessToken } = emettreJetons(request.server, {
    sub: payload.sub,
    telephone: payload.telephone,
    role: payload.role,
  });

  return reply.status(200).send({ status: 'success', accessToken });
};

// 6. Profil de l'utilisateur actuellement authentifié (route protégée de test)
export const obtenirProfil = async (request: FastifyRequest, reply: FastifyReply) => {
  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id: request.utilisateurCourant!.sub },
    include: { client: true, mecanicien: true, administrateur: true },
  });

  if (!utilisateur) {
    return reply.status(404).send({ status: 'error', message: 'Utilisateur introuvable.' });
  }

  return reply.status(200).send({ status: 'success', data: assainirUtilisateur(utilisateur) });
};
