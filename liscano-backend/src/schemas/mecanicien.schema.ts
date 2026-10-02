import { z } from 'zod';

export const rechercheProchesSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  rayonKm: z.coerce.number().min(0.5).max(200).default(20),
  specialiteId: z.coerce.number().int().positive().optional(),
  limite: z.coerce.number().int().min(1).max(50).default(20),
});
export type RechercheProchesInput = z.infer<typeof rechercheProchesSchema>;

export const mettreAJourPositionSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});
export type MettreAJourPositionInput = z.infer<typeof mettreAJourPositionSchema>;

export const mettreAJourDisponibiliteSchema = z.object({
  estDisponible: z.boolean(),
});
export type MettreAJourDisponibiliteInput = z.infer<typeof mettreAJourDisponibiliteSchema>;

export const gererSpecialitesSchema = z.object({
  specialiteIds: z
    .array(z.coerce.number().int().positive())
    .min(1, 'Au moins une spécialité doit être fournie.')
    .max(20),
});
export type GererSpecialitesInput = z.infer<typeof gererSpecialitesSchema>;

export const creerSpecialiteSchema = z.object({
  nomService: z.string().trim().min(2).max(80),
  description: z.string().trim().max(300).optional(),
});
export type CreerSpecialiteInput = z.infer<typeof creerSpecialiteSchema>;
