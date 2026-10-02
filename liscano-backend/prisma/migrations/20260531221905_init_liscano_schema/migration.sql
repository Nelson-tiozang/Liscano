-- CreateEnum
CREATE TYPE "StatutDemande" AS ENUM ('EN_ATTENTE', 'ACCEPTE', 'EN_COURS', 'TERMINE', 'ANNULE');

-- CreateEnum
CREATE TYPE "StatutPaiement" AS ENUM ('EN_ATTENTE', 'PAYE', 'ECHOUE', 'REVERSE');

-- CreateEnum
CREATE TYPE "ModePaiement" AS ENUM ('MOBILE_MONEY', 'CASH', 'ACOMPTE');

-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "dateInscription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statutCompte" TEXT NOT NULL DEFAULT 'ACTIF',

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mecanicien" (
    "id" TEXT NOT NULL,
    "nomGarage" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "geohash" TEXT NOT NULL,
    "estDisponible" BOOLEAN NOT NULL DEFAULT true,
    "noteMoyenne" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "estVerifie" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Mecanicien_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specialite" (
    "id" SERIAL NOT NULL,
    "nomService" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Specialite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MecanicienSpecialite" (
    "mecanicienId" TEXT NOT NULL,
    "specialiteId" INTEGER NOT NULL,

    CONSTRAINT "MecanicienSpecialite_pkey" PRIMARY KEY ("mecanicienId","specialiteId")
);

-- CreateTable
CREATE TABLE "DemandeDepannage" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "mecanicienId" TEXT NOT NULL,
    "latitudePanne" DOUBLE PRECISION NOT NULL,
    "longitudePanne" DOUBLE PRECISION NOT NULL,
    "descriptionPanne" TEXT NOT NULL,
    "statut" "StatutDemande" NOT NULL DEFAULT 'EN_ATTENTE',
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prixConvenu" DECIMAL(10,2),

    CONSTRAINT "DemandeDepannage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paiement" (
    "id" TEXT NOT NULL,
    "demandeId" TEXT NOT NULL,
    "montantTotal" DECIMAL(10,2) NOT NULL,
    "commissionPlateforme" DECIMAL(10,2) NOT NULL,
    "partMecanicien" DECIMAL(10,2) NOT NULL,
    "modePaiement" "ModePaiement" NOT NULL,
    "statutPaiement" "StatutPaiement" NOT NULL DEFAULT 'EN_ATTENTE',
    "referenceTransaction" TEXT,

    CONSTRAINT "Paiement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Avis" (
    "id" TEXT NOT NULL,
    "demandeId" TEXT NOT NULL,
    "note" INTEGER NOT NULL,
    "commentaire" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Avis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_telephone_key" ON "Utilisateur"("telephone");

-- CreateIndex
CREATE INDEX "Mecanicien_geohash_idx" ON "Mecanicien"("geohash");

-- CreateIndex
CREATE UNIQUE INDEX "Specialite_nomService_key" ON "Specialite"("nomService");

-- CreateIndex
CREATE UNIQUE INDEX "Paiement_demandeId_key" ON "Paiement"("demandeId");

-- CreateIndex
CREATE UNIQUE INDEX "Paiement_referenceTransaction_key" ON "Paiement"("referenceTransaction");

-- CreateIndex
CREATE UNIQUE INDEX "Avis_demandeId_key" ON "Avis"("demandeId");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_id_fkey" FOREIGN KEY ("id") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mecanicien" ADD CONSTRAINT "Mecanicien_id_fkey" FOREIGN KEY ("id") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MecanicienSpecialite" ADD CONSTRAINT "MecanicienSpecialite_mecanicienId_fkey" FOREIGN KEY ("mecanicienId") REFERENCES "Mecanicien"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MecanicienSpecialite" ADD CONSTRAINT "MecanicienSpecialite_specialiteId_fkey" FOREIGN KEY ("specialiteId") REFERENCES "Specialite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandeDepannage" ADD CONSTRAINT "DemandeDepannage_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandeDepannage" ADD CONSTRAINT "DemandeDepannage_mecanicienId_fkey" FOREIGN KEY ("mecanicienId") REFERENCES "Mecanicien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paiement" ADD CONSTRAINT "Paiement_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "DemandeDepannage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avis" ADD CONSTRAINT "Avis_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "DemandeDepannage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
