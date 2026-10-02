import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth.api';
import { stockageJetons } from '../api/client';
import type { Role, Utilisateur } from '../types';

function determinerRole(utilisateur: Utilisateur): Role {
  if (utilisateur.administrateur) return 'ADMINISTRATEUR';
  if (utilisateur.mecanicien) return 'MECANICIEN';
  return 'CLIENT';
}

interface AuthContextValue {
  utilisateur: Utilisateur | null;
  role: Role | null;
  chargement: boolean;
  connecte: boolean;
  connexion: (telephone: string, motDePasse: string) => Promise<Role>;
  inscrireClient: (payload: { nom: string; prenom: string; telephone: string; motDePasse: string }) => Promise<void>;
  inscrireMecanicien: (payload: {
    nom: string;
    prenom: string;
    telephone: string;
    motDePasse: string;
    nomGarage?: string;
    latitude: number;
    longitude: number;
  }) => Promise<void>;
  deconnexion: () => void;
  rafraichirProfil: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [chargement, setChargement] = useState(true);

  const chargerProfil = useCallback(async () => {
    if (!stockageJetons.obtenirAccess()) {
      setChargement(false);
      return;
    }
    try {
      const profil = await authApi.obtenirProfil();
      setUtilisateur(profil);
    } catch {
      stockageJetons.effacer();
      setUtilisateur(null);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    chargerProfil();
  }, [chargerProfil]);

  const connexion = useCallback(async (telephone: string, motDePasse: string) => {
    const reponse = await authApi.connexion({ telephone, motDePasse });
    stockageJetons.enregistrer(reponse.accessToken, reponse.refreshToken);
    setUtilisateur(reponse.data);
    return determinerRole(reponse.data);
  }, []);

  const inscrireClient = useCallback(
    async (payload: { nom: string; prenom: string; telephone: string; motDePasse: string }) => {
      const reponse = await authApi.inscrireClient(payload);
      stockageJetons.enregistrer(reponse.accessToken, reponse.refreshToken);
      setUtilisateur(reponse.data);
    },
    []
  );

  const inscrireMecanicien = useCallback(
    async (payload: {
      nom: string;
      prenom: string;
      telephone: string;
      motDePasse: string;
      nomGarage?: string;
      latitude: number;
      longitude: number;
    }) => {
      const reponse = await authApi.inscrireMecanicien(payload);
      stockageJetons.enregistrer(reponse.accessToken, reponse.refreshToken);
      setUtilisateur(reponse.data);
    },
    []
  );

  const deconnexion = useCallback(() => {
    stockageJetons.effacer();
    setUtilisateur(null);
  }, []);

  const valeur = useMemo<AuthContextValue>(
    () => ({
      utilisateur,
      role: utilisateur ? determinerRole(utilisateur) : null,
      chargement,
      connecte: !!utilisateur,
      connexion,
      inscrireClient,
      inscrireMecanicien,
      deconnexion,
      rafraichirProfil: chargerProfil,
    }),
    [utilisateur, chargement, connexion, inscrireClient, inscrireMecanicien, deconnexion, chargerProfil]
  );

  return <AuthContext.Provider value={valeur}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé à l’intérieur de <AuthProvider>');
  return ctx;
}
