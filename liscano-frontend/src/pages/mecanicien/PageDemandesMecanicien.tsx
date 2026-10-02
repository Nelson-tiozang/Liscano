import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { demandeApi } from '../../api/demande.api';
import type { Demande, StatutDemande } from '../../types';
import { BadgeStatutDemande, Carte, ChampSelect, EtatVide, Spinner } from '../../components/ui/Primitives';

const OPTIONS_STATUT: { valeur: StatutDemande | ''; label: string }[] = [
  { valeur: '', label: 'Toutes' },
  { valeur: 'EN_ATTENTE', label: 'En attente' },
  { valeur: 'ACCEPTE', label: 'Acceptées' },
  { valeur: 'EN_COURS', label: 'En cours' },
  { valeur: 'TERMINE', label: 'Terminées' },
  { valeur: 'ANNULE', label: 'Annulées' },
];

export default function PageDemandesMecanicien() {
  const [demandes, setDemandes] = useState<Demande[] | null>(null);
  const [statut, setStatut] = useState<StatutDemande | ''>('');

  useEffect(() => {
    charger(statut);
  }, [statut]);

  function charger(s: StatutDemande | '') {
    demandeApi.listerMiennes(s || undefined).then((r) => setDemandes(r.data));
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-ink">Demandes reçues</h1>
        <div className="w-48">
          <ChampSelect label="" value={statut} onChange={(e) => setStatut(e.target.value as StatutDemande | '')}>
            {OPTIONS_STATUT.map((o) => (
              <option key={o.valeur} value={o.valeur}>
                {o.label}
              </option>
            ))}
          </ChampSelect>
        </div>
      </div>

      {demandes === null ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : demandes.length === 0 ? (
        <div className="mt-6">
          <EtatVide titre="Aucune demande" description="Passe disponible pour commencer à recevoir des demandes." />
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {demandes.map((d) => (
            <li key={d.id}>
              <Link to={`/mecanicien/demandes/${d.id}`}>
                <Carte className="transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">
                        {d.client?.utilisateur.prenom} {d.client?.utilisateur.nom}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-ink-muted">{d.descriptionPanne}</p>
                      <p className="mt-1 text-xs text-ink-muted">
                        {new Date(d.dateCreation).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    <BadgeStatutDemande statut={d.statut} />
                  </div>
                </Carte>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
