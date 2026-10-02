import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hacherMotDePasse } from '../src/utils/password.util.js';

const prisma = new PrismaClient();

/**
 * Crée le tout premier administrateur du système.
 * Utile car la route POST /api/auth/inscription/administrateur est protégée
 * et nécessite déjà un administrateur connecté (poule et œuf).
 *
 * Usage : npm run seed
 */
async function main() {
  const nom = process.env.ADMIN_SEED_NOM;
  const prenom = process.env.ADMIN_SEED_PRENOM;
  const telephone = process.env.ADMIN_SEED_TELEPHONE;
  const motDePasse = process.env.ADMIN_SEED_MOT_DE_PASSE;

  if (!nom || !prenom || !telephone || !motDePasse) {
    throw new Error(
      'Variables ADMIN_SEED_* manquantes dans .env (NOM, PRENOM, TELEPHONE, MOT_DE_PASSE).'
    );
  }

  const existant = await prisma.utilisateur.findUnique({ where: { telephone } });
  if (existant) {
    console.log(`ℹ️  Un utilisateur avec le téléphone ${telephone} existe déjà, seed ignoré.`);
    return;
  }

  const motDePasseHache = await hacherMotDePasse(motDePasse);

  const admin = await prisma.utilisateur.create({
    data: {
      nom,
      prenom,
      telephone,
      motDePasse: motDePasseHache,
      administrateur: { create: { niveauAcces: 'SUPER_ADMIN' } },
    },
  });

  console.log(`✅ Administrateur créé : ${admin.prenom} ${admin.nom} (${admin.telephone})`);
  console.log('⚠️  Pense à changer ce mot de passe après la première connexion.');
}

main()
  .catch((error) => {
    console.error('❌ Échec du seed :', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
