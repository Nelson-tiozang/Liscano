import bcrypt from 'bcryptjs';

/**
 * Nombre de "rounds" de salage. 12 est un bon compromis sécurité/performance en 2026.
 */
const SALT_ROUNDS = 12;

/**
 * Hache un mot de passe en clair avant stockage en base.
 * Ne JAMAIS stocker un mot de passe en clair dans la table Utilisateur.
 */
export async function hacherMotDePasse(motDePasseClair: string): Promise<string> {
  return bcrypt.hash(motDePasseClair, SALT_ROUNDS);
}

/**
 * Compare un mot de passe en clair (saisi par l'utilisateur) avec le hash stocké en base.
 * Retourne true si les deux correspondent.
 */
export async function verifierMotDePasse(
  motDePasseClair: string,
  hashStocke: string
): Promise<boolean> {
  return bcrypt.compare(motDePasseClair, hashStocke);
}
