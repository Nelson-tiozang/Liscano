import { z } from 'zod';

export const initierPaiementSchema = z.object({
  modePaiement: z.enum(['MOBILE_MONEY', 'CASH', 'ACOMPTE']),
});
export type InitierPaiementInput = z.infer<typeof initierPaiementSchema>;

export const simulerWebhookSchema = z.object({
  resultat: z.enum(['PAYE', 'ECHOUE']),
});
export type SimulerWebhookInput = z.infer<typeof simulerWebhookSchema>;
