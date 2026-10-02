import { api } from './client';
import type { Demande, ReponseApi, StatutDemande } from '../types';

export const demandeApi = {
  creer: (payload: {
    mecanicienId: string;
    latitudePanne: number;
    longitudePanne: number;
    descriptionPanne: string;
  }) => api.post<ReponseApi<Demande>>('/api/demandes', payload).then((r) => r.data.data),

  listerMiennes: (statut?: StatutDemande) =>
    api
      .get<ReponseApi<Demande[]>>('/api/demandes', { params: statut ? { statut } : {} })
      .then((r) => r.data),

  obtenir: (id: string) => api.get<ReponseApi<Demande>>(`/api/demandes/${id}`).then((r) => r.data.data),

  accepter: (id: string) =>
    api.patch<ReponseApi<Demande>>(`/api/demandes/${id}/accepter`).then((r) => r.data.data),

  refuser: (id: string, motif?: string) =>
    api.patch<ReponseApi<Demande>>(`/api/demandes/${id}/refuser`, { motif }).then((r) => r.data.data),

  demarrer: (id: string) =>
    api.patch<ReponseApi<Demande>>(`/api/demandes/${id}/demarrer`).then((r) => r.data.data),

  terminer: (id: string, prixConvenu: number) =>
    api
      .patch<ReponseApi<Demande>>(`/api/demandes/${id}/terminer`, { prixConvenu })
      .then((r) => r.data.data),

  annuler: (id: string, motif?: string) =>
    api.patch<ReponseApi<Demande>>(`/api/demandes/${id}/annuler`, { motif }).then((r) => r.data.data),
};
