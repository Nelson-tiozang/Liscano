import { api } from './client';
import type { ModePaiement, Paiement, ReponseApi } from '../types';

export const paiementApi = {
  initier: (demandeId: string, modePaiement: ModePaiement) =>
    api
      .post<ReponseApi<Paiement>>(`/api/demandes/${demandeId}/paiement`, { modePaiement })
      .then((r) => r.data),

  obtenir: (id: string) => api.get<ReponseApi<Paiement>>(`/api/paiements/${id}`).then((r) => r.data.data),

  confirmerCash: (id: string) =>
    api.patch<ReponseApi<Paiement>>(`/api/paiements/${id}/confirmer-cash`).then((r) => r.data.data),

  simulerWebhook: (id: string, resultat: 'PAYE' | 'ECHOUE') =>
    api
      .post<ReponseApi<Paiement>>(`/api/paiements/${id}/simuler-webhook`, { resultat })
      .then((r) => r.data.data),
};
