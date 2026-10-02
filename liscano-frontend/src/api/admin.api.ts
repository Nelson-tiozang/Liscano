import { api } from './client';
import type { Demande, ReponseApi, Role, StatutCompte, StatutDemande, Statistiques, Utilisateur } from '../types';

export const adminApi = {
  statistiques: () => api.get<ReponseApi<Statistiques>>('/api/admin/statistiques').then((r) => r.data.data),

  listerUtilisateurs: (params: { role?: Role; page?: number; limite?: number }) =>
    api.get<ReponseApi<Utilisateur[]>>('/api/admin/utilisateurs', { params }).then((r) => r.data),

  modifierStatutCompte: (id: string, statutCompte: StatutCompte) =>
    api
      .patch<ReponseApi<Utilisateur>>(`/api/admin/utilisateurs/${id}/statut`, { statutCompte })
      .then((r) => r.data.data),

  listerDemandes: (params: { statut?: StatutDemande; page?: number; limite?: number }) =>
    api.get<ReponseApi<Demande[]>>('/api/admin/demandes', { params }).then((r) => r.data),
};
