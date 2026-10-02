import { FastifyRequest, FastifyReply } from 'fastify';
import { Prisma } from '@prisma/client';
import prisma from '../config/database.js';
import { encoderGeohash } from '../utils/geohash.util.js';
import {
  rechercheProchesSchema,
  mettreAJourPositionSchema,
  mettreAJourDisponibiliteSchema,
  gererSpecialitesSchema,
} from '../schemas/mecanicien.schema.js';

const KM_PAR_DEGRE_LATITUDE = 111;

interface MecanicienProcheRow {
  id: string;
  nomGarage: string | null;
  latitude: number;
  longitude: number;
  estDisponible: boolean;
  noteMoyenne: number;
  estVerifie: boolean;
  nom: string;
  prenom: string;
  telephone: string;
  distanceKm: number;
}

/**
 * Recherche des mécaniciens disponibles autour d'un point donné, triés par distance.
 *
 * Approche en deux temps pour rester performant sans extension PostGIS :
 *  1. Pré-filtrage par bounding box (latitude/longitude BETWEEN) qui exploite
 *     l'index composite `Mecanicien_latitude_longitude_idx`.
 *  2. Calcul de la distance exacte (formule de Haversine) uniquement sur ce
 *     sous-ensemble restreint, puis tri et découpe au rayon demandé.
 *
 * Le numéro de téléphone est volontairement inclus dans la réponse : c'est le
 * cœur du scénario Liscano (le client appelle directement le mécanicien trouvé).
 */
export const listerMecaniciensProches = async (request: FastifyRequest, reply: FastifyReply) => {
  const { latitude, longitude, rayonKm, specialiteId, limite } = rechercheProchesSchema.parse(
    request.query
  );

  // Bounding box large (marge de sécurité) autour du point de recherche.
  const deltaLat = rayonKm / KM_PAR_DEGRE_LATITUDE;
  const kmParDegreLongitude = Math.max(
    KM_PAR_DEGRE_LATITUDE * Math.cos((latitude * Math.PI) / 180),
    1 // évite une division par ~0 près des pôles (non pertinent au Cameroun, mais sûr)
  );
  const deltaLon = rayonKm / kmParDegreLongitude;

  const filtreSpecialite = specialiteId
    ? Prisma.sql`AND m.id IN (SELECT "mecanicienId" FROM "MecanicienSpecialite" WHERE "specialiteId" = ${specialiteId})`
    : Prisma.empty;

  const resultats = await prisma.$queryRaw<MecanicienProcheRow[]>`
    WITH candidats AS (
      SELECT
        m.id,
        m."nomGarage"     AS "nomGarage",
        m.latitude,
        m.longitude,
        m."estDisponible" AS "estDisponible",
        m."noteMoyenne"   AS "noteMoyenne",
        m."estVerifie"    AS "estVerifie",
        u.nom,
        u.prenom,
        u.telephone,
        (
          6371 * acos(
            LEAST(1.0, GREATEST(-1.0,
              cos(radians(${latitude})) * cos(radians(m.latitude)) * cos(radians(m.longitude) - radians(${longitude}))
              + sin(radians(${latitude})) * sin(radians(m.latitude))
            ))
          )
        ) AS "distanceKm"
      FROM "Mecanicien" m
      JOIN "Utilisateur" u ON u.id = m.id
      WHERE m."estDisponible" = true
        AND m.latitude  BETWEEN ${latitude - deltaLat} AND ${latitude + deltaLat}
        AND m.longitude BETWEEN ${longitude - deltaLon} AND ${longitude + deltaLon}
        ${filtreSpecialite}
    )
    SELECT * FROM candidats
    WHERE "distanceKm" <= ${rayonKm}
    ORDER BY "distanceKm" ASC
    LIMIT ${limite};
  `;

  return reply.status(200).send({
    status: 'success',
    resultats: resultats.length,
    data: resultats.map((r) => ({ ...r, distanceKm: Number(r.distanceKm.toFixed(2)) })),
  });
};

// Détail public d'un mécanicien (fiche consultée avant l'appel)
export const obtenirMecanicien = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };

  const mecanicien = await prisma.mecanicien.findUnique({
    where: { id },
    include: {
      utilisateur: { select: { nom: true, prenom: true, telephone: true, statutCompte: true } },
      specialites: { include: { specialite: true } },
    },
  });

  if (!mecanicien || mecanicien.utilisateur.statutCompte !== 'ACTIF') {
    return reply.status(404).send({ status: 'error', message: 'Mécanicien introuvable.' });
  }

  return reply.status(200).send({ status: 'success', data: mecanicien });
};

// Profil complet du mécanicien connecté
export const obtenirMonProfilMecanicien = async (request: FastifyRequest, reply: FastifyReply) => {
  const mecanicien = await prisma.mecanicien.findUnique({
    where: { id: request.utilisateurCourant!.sub },
    include: {
      utilisateur: { select: { nom: true, prenom: true, telephone: true } },
      specialites: { include: { specialite: true } },
    },
  });

  if (!mecanicien) {
    return reply.status(404).send({ status: 'error', message: 'Profil mécanicien introuvable.' });
  }

  return reply.status(200).send({ status: 'success', data: mecanicien });
};

// Mise à jour de la position en temps réel (ping GPS depuis l'app mobile du mécanicien)
export const mettreAJourPosition = async (request: FastifyRequest, reply: FastifyReply) => {
  const { latitude, longitude } = mettreAJourPositionSchema.parse(request.body);
  const geohash = encoderGeohash(latitude, longitude);

  const mecanicien = await prisma.mecanicien.update({
    where: { id: request.utilisateurCourant!.sub },
    data: { latitude, longitude, geohash },
  });

  return reply.status(200).send({ status: 'success', data: mecanicien });
};

// Bascule disponible / indisponible
export const mettreAJourDisponibilite = async (request: FastifyRequest, reply: FastifyReply) => {
  const { estDisponible } = mettreAJourDisponibiliteSchema.parse(request.body);

  const mecanicien = await prisma.mecanicien.update({
    where: { id: request.utilisateurCourant!.sub },
    data: { estDisponible },
  });

  return reply.status(200).send({ status: 'success', data: mecanicien });
};

// Ajoute une ou plusieurs spécialités au mécanicien connecté
export const ajouterSpecialites = async (request: FastifyRequest, reply: FastifyReply) => {
  const { specialiteIds } = gererSpecialitesSchema.parse(request.body);
  const mecanicienId = request.utilisateurCourant!.sub;

  await prisma.mecanicienSpecialite.createMany({
    data: specialiteIds.map((specialiteId) => ({ mecanicienId, specialiteId })),
    skipDuplicates: true,
  });

  const specialites = await prisma.mecanicienSpecialite.findMany({
    where: { mecanicienId },
    include: { specialite: true },
  });

  return reply.status(200).send({ status: 'success', data: specialites });
};

// Retire une spécialité du mécanicien connecté
export const retirerSpecialite = async (request: FastifyRequest, reply: FastifyReply) => {
  const { specialiteId } = request.params as { specialiteId: string };
  const mecanicienId = request.utilisateurCourant!.sub;

  await prisma.mecanicienSpecialite.delete({
    where: {
      mecanicienId_specialiteId: { mecanicienId, specialiteId: Number(specialiteId) },
    },
  });

  return reply.status(204).send();
};

// Liste publique de toutes les spécialités disponibles sur la plateforme
export const listerSpecialites = async (_request: FastifyRequest, reply: FastifyReply) => {
  const specialites = await prisma.specialite.findMany({ orderBy: { nomService: 'asc' } });
  return reply.status(200).send({ status: 'success', data: specialites });
};
