import { z } from 'zod';

/**
 * Numéro de téléphone camerounais : accepte le format local (6XXXXXXXX, 9 chiffres)
 * ou international (+2376XXXXXXXX).
 */
const telephoneSchema = z
  .string()
  .trim()
  .regex(/^(?:\+237)?6\d{8}$/, "Numéro de téléphone camerounais invalide (ex: 6XXXXXXXX ou +2376XXXXXXXX).");

const motDePasseSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères.')
  .max(72, 'Le mot de passe est trop long (72 caractères max, limite bcrypt).');

const nomSchema = z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères.').max(80);
const prenomSchema = z.string().trim().min(2, 'Le prénom doit contenir au moins 2 caractères.').max(80);

export const inscriptionClientSchema = z.object({
  nom: nomSchema,
  prenom: prenomSchema,
  telephone: telephoneSchema,
  motDePasse: motDePasseSchema,
});
export type InscriptionClientInput = z.infer<typeof inscriptionClientSchema>;

export const inscriptionMecanicienSchema = z.object({
  nom: nomSchema,
  prenom: prenomSchema,
  telephone: telephoneSchema,
  motDePasse: motDePasseSchema,
  nomGarage: z.string().trim().max(120).optional(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});
export type InscriptionMecanicienInput = z.infer<typeof inscriptionMecanicienSchema>;

// L'inscription d'un administrateur n'est jamais publique : elle est protégée
// par le middleware d'autorisation (rôle ADMINISTRATEUR requis) en amont.
export const inscriptionAdministrateurSchema = z.object({
  nom: nomSchema,
  prenom: prenomSchema,
  telephone: telephoneSchema,
  motDePasse: motDePasseSchema,
  niveauAcces: z.enum(['SUPER_ADMIN', 'ADMIN', 'MODERATEUR']).optional(),
});
export type InscriptionAdministrateurInput = z.infer<typeof inscriptionAdministrateurSchema>;

export const connexionSchema = z.object({
  telephone: telephoneSchema,
  motDePasse: z.string().min(1, 'Le mot de passe est requis.'),
});
export type ConnexionInput = z.infer<typeof connexionSchema>;

export const rafraichirTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Le refresh token est requis.'),
});
export type RafraichirTokenInput = z.infer<typeof rafraichirTokenSchema>;
