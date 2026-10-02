export type Role = 'CLIENT' | 'MECANICIEN' | 'ADMINISTRATEUR';
export type StatutCompte = 'ACTIF' | 'SUSPENDU' | 'BANNI';
export type StatutDemande = 'EN_ATTENTE' | 'ACCEPTE' | 'EN_COURS' | 'TERMINE' | 'ANNULE';
export type StatutPaiement = 'EN_ATTENTE' | 'PAYE' | 'ECHOUE' | 'REVERSE';
export type ModePaiement = 'MOBILE_MONEY' | 'CASH' | 'ACOMPTE';

export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  dateInscription: string;
  statutCompte: StatutCompte;
  client?: { id: string } | null;
  mecanicien?: Mecanicien | null;
  administrateur?: { id: string; niveauAcces: string } | null;
}

export interface Specialite {
  id: number;
  nomService: string;
  description?: string | null;
}

export interface Mecanicien {
  id: string;
  nomGarage?: string | null;
  latitude: number;
  longitude: number;
  geohash?: string;
  estDisponible: boolean;
  estVerifie: boolean;
  noteMoyenne: number;
  utilisateur?: { nom: string; prenom: string; telephone: string };
  specialites?: { specialite: Specialite }[];
}

export interface MecanicienProche {
  id: string;
  nomGarage: string | null;
  latitude: number;
  longitude: number;
  estDisponible: boolean;
  noteMoyenne: number;
  estVerifie: boolean;
  nom: string;
  prenom: string;
  telephone: string;
  distanceKm: number;
}

export interface Paiement {
  id: string;
  demandeId: string;
  montantTotal: string;
  commissionPlateforme: string;
  partMecanicien: string;
  modePaiement: ModePaiement;
  statutPaiement: StatutPaiement;
  referenceTransaction: string | null;
  dateCreation: string;
  dateMiseAJourStatut: string | null;
}

export interface Avis {
  id: string;
  demandeId: string;
  note: number;
  commentaire?: string | null;
  date: string;
}

export interface Demande {
  id: string;
  clientId: string;
  mecanicienId: string;
  latitudePanne: number;
  longitudePanne: number;
  descriptionPanne: string;
  statut: StatutDemande;
  dateCreation: string;
  dateAcceptation?: string | null;
  dateDebut?: string | null;
  dateFin?: string | null;
  motifAnnulation?: string | null;
  prixConvenu?: string | null;
  client?: { utilisateur: { nom: string; prenom: string; telephone: string } };
  mecanicien?: { utilisateur: { nom: string; prenom: string; telephone: string }; nomGarage?: string | null };
  paiement?: Paiement | null;
  avis?: Avis | null;
}

export interface ReponseApi<T> {
  status: 'success' | 'error';
  message?: string;
  data: T;
  resultats?: number;
  pagination?: { page: number; limite: number; total: number; pages: number };
}

export interface Statistiques {
  totalClients: number;
  totalMecaniciens: number;
  mecaniciensDisponibles: number;
  demandesParStatut: Record<string, number>;
  chiffreAffaireTotal: string | number;
  commissionTotale: string | number;
}
