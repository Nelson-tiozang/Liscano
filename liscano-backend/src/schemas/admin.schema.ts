import { z } from 'zod';

export const listerUtilisateursSchema = z.object({
  role: z.enum(['CLIENT', 'MECANICIEN', 'ADMINISTRATEUR']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListerUtilisateursInput = z.infer<typeof listerUtilisateursSchema>;

export const modifierStatutCompteSchema = z.object({
  statutCompte: z.enum(['ACTIF', 'SUSPENDU', 'BANNI']),
});
export type ModifierStatutCompteInput = z.infer<typeof modifierStatutCompteSchema>;

export const listerDemandesAdminSchema = z.object({
  statut: z.enum(['EN_ATTENTE', 'ACCEPTE', 'EN_COURS', 'TERMINE', 'ANNULE']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListerDemandesAdminInput = z.infer<typeof listerDemandesAdminSchema>;
