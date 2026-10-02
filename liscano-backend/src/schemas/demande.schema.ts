import { z } from 'zod';

export const creerDemandeSchema = z.object({
  mecanicienId: z.string().uuid("Identifiant de mécanicien invalide."),
  latitudePanne: z.coerce.number().min(-90).max(90),
  longitudePanne: z.coerce.number().min(-180).max(180),
  descriptionPanne: z
    .string()
    .trim()
    .min(10, 'Décris la panne en au moins 10 caractères pour que le mécanicien se prépare.')
    .max(1000),
});
export type CreerDemandeInput = z.infer<typeof creerDemandeSchema>;

export const annulerDemandeSchema = z.object({
  motif: z.string().trim().max(300).optional(),
});
export type AnnulerDemandeInput = z.infer<typeof annulerDemandeSchema>;

export const terminerInterventionSchema = z.object({
  prixConvenu: z.coerce.number().positive('Le prix convenu doit être positif.').max(10_000_000),
});
export type TerminerInterventionInput = z.infer<typeof terminerInterventionSchema>;
