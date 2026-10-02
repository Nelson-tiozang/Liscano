-- AlterTable: Mecanicien — index composite pour la recherche géographique par bounding box
CREATE INDEX "Mecanicien_latitude_longitude_idx" ON "Mecanicien"("latitude", "longitude");

-- AlterTable: DemandeDepannage — horodatages des transitions d'état + motif d'annulation
ALTER TABLE "DemandeDepannage"
  ADD COLUMN "dateAcceptation" TIMESTAMP(3),
  ADD COLUMN "dateDebut" TIMESTAMP(3),
  ADD COLUMN "dateFin" TIMESTAMP(3),
  ADD COLUMN "motifAnnulation" TEXT;

CREATE INDEX "DemandeDepannage_clientId_idx" ON "DemandeDepannage"("clientId");
CREATE INDEX "DemandeDepannage_mecanicienId_idx" ON "DemandeDepannage"("mecanicienId");
CREATE INDEX "DemandeDepannage_statut_idx" ON "DemandeDepannage"("statut");

-- AlterTable: Paiement — horodatages de création et de dernière mise à jour de statut
ALTER TABLE "Paiement"
  ADD COLUMN "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "dateMiseAJourStatut" TIMESTAMP(3);
