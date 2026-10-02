import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin.api';
import { messageErreur } from '../../api/client';
import type { Demande, StatutDemande } from '../../types';
import { Alerte, BadgeStatutDemande, BadgeStatutPaiement, Carte, ChampSelect, EtatVide, Spinner } from '../../components/ui/Primitives';

const OPTIONS: { valeur: StatutDemande | ''; label: string }[] = [
  { valeur: '', label: 'Toutes' },
  { valeur: 'EN_ATTENTE', label: 'En attente' },
  { valeur: 'ACCEPTE', label: 'Acceptées' },
  { valeur: 'EN_COURS', label: 'En cours' },
  { valeur: 'TERMINE', label: 'Terminées' },
  { valeur: 'ANNULE', label: 'Annulées' },
];

export default function PageDemandesAdmin() {
  const [statut, setStatut] = useState<StatutDemande | ''>('');
  const [demandes, setDemandes] = useState<Demande[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .listerDemandes({ statut: statut || undefined, limite: 50 })
      .then((r) => setDemandes(r.data))
      .catch((err) => setErreur(messageErreur(err)));
  }, [statut]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-ink">Toutes les demandes</h1>
        <div className="w-48">
          <ChampSelect label="" value={statut} onChange={(e) => setStatut(e.target.value as StatutDemande | '')}>
            {OPTIONS.map((o) => (
              <option key={o.valeur} value={o.valeur}>
                {o.label}
              </option>
            ))}
          </ChampSelect>
        </div>
      </div>

      {erreur && (
        <div className="mt-4">
          <Alerte>{erreur}</Alerte>
        </div>
      )}

      {demandes === null ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : demandes.length === 0 ? (
        <div className="mt-6">
          <EtatVide titre="Aucune demande" />
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {demandes.map((d) => (
            <li key={d.id}>
              <Carte>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-ink">
                      <span className="font-medium">
                        {d.client?.utilisateur.prenom} {d.client?.utilisateur.nom}
                      </span>{' '}
                      <span className="text-ink-muted">→</span>{' '}
                      <span className="font-medium">
                        {d.mecanicien?.utilisateur.prenom} {d.mecanicien?.utilisateur.nom}
                      </span>
                    </p>
                    <p className="mt-1 max-w-md truncate text-xs text-ink-muted">{d.descriptionPanne}</p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {new Date(d.dateCreation).toLocaleString('fr-FR')}
                      {d.prixConvenu ? ` · ${Number(d.prixConvenu).toLocaleString('fr-FR')} FCFA` : ''}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <BadgeStatutDemande statut={d.statut} />
                    {d.paiement && <BadgeStatutPaiement statut={d.paiement.statutPaiement} />}
                  </div>
                </div>
              </Carte>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
