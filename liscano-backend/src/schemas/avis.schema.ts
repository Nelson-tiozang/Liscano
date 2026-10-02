import { z } from 'zod';

export const creerAvisSchema = z.object({
  note: z.coerce.number().int().min(1, 'La note doit être comprise entre 1 et 5.').max(5),
  commentaire: z.string().trim().max(500).optional(),
});
export type CreerAvisInput = z.infer<typeof creerAvisSchema>;
