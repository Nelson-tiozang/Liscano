import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin.api';
import { messageErreur } from '../../api/client';
import type { Statistiques } from '../../types';
import { Alerte, Carte, Spinner } from '../../components/ui/Primitives';

const LABEL_STATUT: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  ACCEPTE: 'Acceptées',
  EN_COURS: 'En cours',
  TERMINE: 'Terminées',
  ANNULE: 'Annulées',
};

export default function PageTableauDeBordAdmin() {
  const [stats, setStats] = useState<Statistiques | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    adminApi.statistiques().then(setStats).catch((err) => setErreur(messageErreur(err)));
  }, []);

  if (erreur) return <Alerte>{erreur}</Alerte>;
  if (!stats) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl text-ink">Vue d'ensemble</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CarteStat label="Clients inscrits" valeur={stats.totalClients} />
        <CarteStat label="Mécaniciens inscrits" valeur={stats.totalMecaniciens} />
        <CarteStat label="Disponibles maintenant" valeur={stats.mecaniciensDisponibles} accent />
        <CarteStat
          label="Commission totale"
          valeur={`${Number(stats.commissionTotale).toLocaleString('fr-FR')} FCFA`}
        />
      </div>

      <Carte className="mt-4">
        <p className="text-sm font-medium text-ink-muted">Chiffre d'affaires total (encaissé)</p>
        <p className="font-display mt-1 text-3xl text-ink">
          {Number(stats.chiffreAffaireTotal).toLocaleString('fr-FR')} FCFA
        </p>
      </Carte>

      <Carte className="mt-4">
        <p className="text-sm font-medium text-ink-muted">Demandes par statut</p>
        <div className="mt-3 flex flex-wrap gap-4">
          {Object.entries(LABEL_STATUT).map(([cle, label]) => (
            <div key={cle} className="min-w-[100px]">
              <p className="font-display text-2xl text-ink">{stats.demandesParStatut[cle] ?? 0}</p>
              <p className="text-xs text-ink-muted">{label}</p>
            </div>
          ))}
        </div>
      </Carte>
    </div>
  );
}

function CarteStat({ label, valeur, accent }: { label: string; valeur: string | number; accent?: boolean }) {
  return (
    <Carte>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</p>
      <p className={`font-display mt-1 text-3xl ${accent ? 'text-green' : 'text-ink'}`}>{valeur}</p>
    </Carte>
  );
}
