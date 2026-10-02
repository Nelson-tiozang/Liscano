import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const CLE_ACCESS_TOKEN = 'liscano_access_token';
const CLE_REFRESH_TOKEN = 'liscano_refresh_token';

export const stockageJetons = {
  obtenirAccess: () => localStorage.getItem(CLE_ACCESS_TOKEN),
  obtenirRefresh: () => localStorage.getItem(CLE_REFRESH_TOKEN),
  enregistrer: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(CLE_ACCESS_TOKEN, accessToken);
    localStorage.setItem(CLE_REFRESH_TOKEN, refreshToken);
  },
  mettreAJourAccess: (accessToken: string) => {
    localStorage.setItem(CLE_ACCESS_TOKEN, accessToken);
  },
  effacer: () => {
    localStorage.removeItem(CLE_ACCESS_TOKEN);
    localStorage.removeItem(CLE_REFRESH_TOKEN);
  },
};

export const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = stockageJetons.obtenirAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let rafraichissementEnCours: Promise<string | null> | null = null;

async function rafraichirAccessToken(): Promise<string | null> {
  const refreshToken = stockageJetons.obtenirRefresh();
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post(`${API_BASE_URL}/api/auth/rafraichir`, { refreshToken });
    stockageJetons.mettreAJourAccess(data.accessToken);
    return data.accessToken as string;
  } catch {
    stockageJetons.effacer();
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _dejaRelance?: boolean };

    const estAppelAuth = config?.url?.includes('/api/auth/');
    if (error.response?.status === 401 && config && !config._dejaRelance && !estAppelAuth) {
      config._dejaRelance = true;

      if (!rafraichissementEnCours) {
        rafraichissementEnCours = rafraichirAccessToken().finally(() => {
          rafraichissementEnCours = null;
        });
      }

      const nouveauToken = await rafraichissementEnCours;
      if (nouveauToken) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${nouveauToken}`;
        return api(config);
      }

      // Refresh impossible : on force une reconnexion propre
      stockageJetons.effacer();
      window.location.href = '/connexion';
    }

    return Promise.reject(error);
  }
);

/** Extrait un message d'erreur lisible depuis une réponse API en erreur. */
export function messageErreur(erreur: unknown, defaut = 'Une erreur est survenue.'): string {
  if (axios.isAxiosError(erreur)) {
    const data = erreur.response?.data as { message?: string; erreurs?: { message: string }[] } | undefined;
    if (data?.erreurs?.length) return data.erreurs.map((e) => e.message).join(' ');
    if (data?.message) return data.message;
  }
  return defaut;
}
