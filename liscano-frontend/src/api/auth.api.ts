import { api } from './client';
import type { ReponseApi, Role, Utilisateur } from '../types';

interface ReponseAuth {
  status: string;
  message: string;
  role?: Role;
  data: Utilisateur;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  inscrireClient: (payload: { nom: string; prenom: string; telephone: string; motDePasse: string }) =>
    api.post<ReponseAuth>('/api/auth/inscription/client', payload).then((r) => r.data),

  inscrireMecanicien: (payload: {
    nom: string;
    prenom: string;
    telephone: string;
    motDePasse: string;
    nomGarage?: string;
    latitude: number;
    longitude: number;
  }) => api.post<ReponseAuth>('/api/auth/inscription/mecanicien', payload).then((r) => r.data),

  connexion: (payload: { telephone: string; motDePasse: string }) =>
    api.post<ReponseAuth>('/api/auth/connexion', payload).then((r) => r.data),

  obtenirProfil: () => api.get<ReponseApi<Utilisateur>>('/api/auth/moi').then((r) => r.data.data),

  inscrireAdministrateur: (payload: { nom: string; prenom: string; telephone: string; motDePasse: string }) =>
    api.post<ReponseApi<Utilisateur>>('/api/auth/inscription/administrateur', payload).then((r) => r.data),
};
