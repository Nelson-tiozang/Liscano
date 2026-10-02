import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { demandeApi } from '../../api/demande.api';
import type { Demande } from '../../types';
import { BadgeStatutDemande, Carte, EtatVide, Spinner } from '../../components/ui/Primitives';

export default function PageMesDemandesClient() {
  const [demandes, setDemandes] = useState<Demande[] | null>(null);

  useEffect(() => {
    demandeApi.listerMiennes().then((r) => setDemandes(r.data));
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl text-ink">Mes demandes</h1>

      {demandes === null ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : demandes.length === 0 ? (
        <div className="mt-6">
          <EtatVide
            titre="Aucune demande pour l'instant"
            description="Cherche un mécanicien proche pour envoyer ta première demande."
          />
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {demandes.map((d) => (
            <li key={d.id}>
              <Link to={`/client/demandes/${d.id}`}>
                <Carte className="transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{d.descriptionPanne}</p>
                      <p className="mt-1 text-xs text-ink-muted">
                        {d.mecanicien?.utilisateur.prenom} {d.mecanicien?.utilisateur.nom} ·{' '}
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
