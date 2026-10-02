import crypto from 'node:crypto';
import prisma from '../config/database.js';

/**
 * ⚠️ SIMULATEUR DE DÉVELOPPEMENT — à remplacer par l'intégration réelle MTN MoMo /
 * Orange Money avant la mise en production.
 *
 * Un vrai provider Mobile Money fonctionne de façon asynchrone : on initie la
 * transaction, on reçoit une référence, puis le provider notifie plus tard le
 * résultat via un webhook. Ce mock reproduit ce comportement en mémoire, dans
 * le même process Node, avec un délai aléatoire et un taux de succès simulé —
 * ce qui permet de développer et tester tout le workflow de paiement sans
 * dépendre d'une API externe indisponible en environnement de développement.
 */

const TAUX_SUCCES_SIMULE = 0.9; // 90% de transactions réussies, comme dans la réalité
const DELAI_MIN_MS = 2000;
const DELAI_MAX_MS = 5000;

export function genererReferenceTransactionMock(): string {
  return `MOCK-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
}

/**
 * Planifie la confirmation asynchrone d'un paiement Mobile Money simulé.
 * N'effectue rien de synchrone : la requête HTTP d'origine répond immédiatement
 * avec le statut EN_ATTENTE, exactement comme un vrai provider le ferait.
 */
export function planifierConfirmationMock(paiementId: string): void {
  const delai = DELAI_MIN_MS + Math.random() * (DELAI_MAX_MS - DELAI_MIN_MS);

  setTimeout(async () => {
    try {
      const paiement = await prisma.paiement.findUnique({ where: { id: paiementId } });
      // Le paiement a pu être confirmé/annulé manuellement entre-temps (ex: via simulerWebhook)
      if (!paiement || paiement.statutPaiement !== 'EN_ATTENTE') return;

      const succes = Math.random() < TAUX_SUCCES_SIMULE;
      await prisma.paiement.update({
        where: { id: paiementId },
        data: {
          statutPaiement: succes ? 'PAYE' : 'ECHOUE',
          dateMiseAJourStatut: new Date(),
        },
      });
    } catch (erreur) {
      console.error(`[paiement-mock] Échec de la confirmation simulée pour ${paiementId}:`, erreur);
    }
  }, delai);
}
