import { api } from './client';
import type { Avis, ReponseApi } from '../types';

export const avisApi = {
  creer: (demandeId: string, payload: { note: number; commentaire?: string }) =>
    api.post<ReponseApi<Avis>>(`/api/demandes/${demandeId}/avis`, payload).then((r) => r.data.data),
};
