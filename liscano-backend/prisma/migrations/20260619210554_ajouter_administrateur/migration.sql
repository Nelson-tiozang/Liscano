-- CreateTable
CREATE TABLE "Administrateur" (
    "id" TEXT NOT NULL,
    "niveauAcces" TEXT NOT NULL DEFAULT 'SUPER_ADMIN',

    CONSTRAINT "Administrateur_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Administrateur" ADD CONSTRAINT "Administrateur_id_fkey" FOREIGN KEY ("id") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;
