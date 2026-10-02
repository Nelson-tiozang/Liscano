import { api } from './client';
import type { Avis, Mecanicien, MecanicienProche, ReponseApi, Specialite } from '../types';

export const mecanicienApi = {
  rechercherProches: (params: {
    latitude: number;
    longitude: number;
    rayonKm?: number;
    specialiteId?: number;
    limite?: number;
  }) =>
    api
      .get<ReponseApi<MecanicienProche[]>>('/api/mecaniciens/proches', { params })
      .then((r) => r.data),

  obtenir: (id: string) => api.get<ReponseApi<Mecanicien>>(`/api/mecaniciens/${id}`).then((r) => r.data.data),

  obtenirMonProfil: () =>
    api.get<ReponseApi<Mecanicien>>('/api/mecaniciens/moi/profil').then((r) => r.data.data),

  mettreAJourPosition: (payload: { latitude: number; longitude: number }) =>
    api.patch<ReponseApi<Mecanicien>>('/api/mecaniciens/moi/position', payload).then((r) => r.data.data),

  mettreAJourDisponibilite: (estDisponible: boolean) =>
    api
      .patch<ReponseApi<Mecanicien>>('/api/mecaniciens/moi/disponibilite', { estDisponible })
      .then((r) => r.data.data),

  ajouterSpecialites: (specialiteIds: number[]) =>
    api.post('/api/mecaniciens/moi/specialites', { specialiteIds }).then((r) => r.data),

  retirerSpecialite: (specialiteId: number) =>
    api.delete(`/api/mecaniciens/moi/specialites/${specialiteId}`),

  listerAvis: (mecanicienId: string) =>
    api.get<ReponseApi<Avis[]>>(`/api/mecaniciens/${mecanicienId}/avis`).then((r) => r.data),

  listerSpecialites: () => api.get<ReponseApi<Specialite[]>>('/api/specialites').then((r) => r.data.data),

  creerSpecialite: (payload: { nomService: string; description?: string }) =>
    api.post<ReponseApi<Specialite>>('/api/specialites', payload).then((r) => r.data.data),

  supprimerSpecialite: (id: number) => api.delete(`/api/specialites/${id}`),
};
