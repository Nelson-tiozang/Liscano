import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { mecanicienApi } from '../../api/mecanicien.api';
import { messageErreur } from '../../api/client';
import { obtenirPositionActuelle } from '../../utils/geolocation';
import type { Mecanicien } from '../../types';
import { Alerte, Bouton, Carte, Etoiles, Spinner } from '../../components/ui/Primitives';

export default function PageTableauDeBordMecanicien() {
  const [profil, setProfil] = useState<Mecanicien | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [bascule, setBascule] = useState(false);
  const [localisation, setLocalisation] = useState(false);

  useEffect(() => {
    charger();
  }, []);

  function charger() {
    setChargement(true);
    mecanicienApi
      .obtenirMonProfil()
      .then(setProfil)
      .catch((err) => setErreur(messageErreur(err)))
      .finally(() => setChargement(false));
  }

  async function basculerDisponibilite() {
    if (!profil) return;
    setBascule(true);
    setErreur(null);
    try {
      const misAJour = await mecanicienApi.mettreAJourDisponibilite(!profil.estDisponible);
      setProfil({ ...profil, ...misAJour });
    } catch (err) {
      setErreur(messageErreur(err, 'Impossible de mettre à jour la disponibilité.'));
    } finally {
      setBascule(false);
    }
  }

  async function actualiserPosition() {
    setLocalisation(true);
    setErreur(null);
    try {
      const position = await obtenirPositionActuelle();
      const misAJour = await mecanicienApi.mettreAJourPosition(position);
      setProfil((p) => (p ? { ...p, ...misAJour } : p));
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Localisation impossible.');
    } finally {
      setLocalisation(false);
    }
  }

  if (chargement) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!profil) {
    return <Alerte>{erreur ?? 'Profil introuvable.'}</Alerte>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl text-ink">Tableau de bord</h1>
      {erreur && (
        <div className="mt-4">
          <Alerte>{erreur}</Alerte>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Carte>
          <p className="text-sm font-medium text-ink-muted">Statut</p>
          <div className="mt-2 flex items-center justify-between">
            <span className={`text-lg font-semibold ${profil.estDisponible ? 'text-green' : 'text-red'}`}>
              {profil.estDisponible ? 'Disponible' : 'Indisponible'}
            </span>
            <button
              role="switch"
              aria-checked={profil.estDisponible}
              onClick={basculerDisponibilite}
              disabled={bascule}
              className={`relative h-7 w-12 rounded-full transition-colors disabled:opacity-50 ${
                profil.estDisponible ? 'bg-green' : 'bg-ink/20'
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  profil.estDisponible ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-muted">
            {profil.estDisponible
              ? 'Tu apparais dans les recherches des clients à proximité.'
              : 'Tu es masqué des recherches. Passe disponible pour recevoir des demandes.'}
          </p>
        </Carte>

        <Carte>
          <p className="text-sm font-medium text-ink-muted">Note moyenne</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-display text-2xl text-ink">{profil.noteMoyenne.toFixed(1)}</span>
            <Etoiles note={profil.noteMoyenne} />
          </div>
          <p className="mt-2 text-xs text-ink-muted">
            {profil.estVerifie ? 'Compte vérifié par Liscano.' : 'Compte pas encore vérifié.'}
          </p>
        </Carte>
      </div>

      <Carte className="mt-4">
        <p className="text-sm font-medium text-ink-muted">Position actuelle</p>
        <p className="font-mono mt-1 text-sm text-ink">
          {profil.latitude.toFixed(4)}, {profil.longitude.toFixed(4)}
        </p>
        <Bouton variante="fantome" onClick={actualiserPosition} enChargement={localisation} className="mt-3">
          Actualiser ma position GPS
        </Bouton>
      </Carte>

      <Carte className="mt-4">
        <p className="text-sm font-medium text-ink-muted">Spécialités</p>
        {profil.specialites && profil.specialites.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {profil.specialites.map((s) => (
              <span
                key={s.specialite.id}
                className="rounded-full bg-navy/10 px-3 py-1 text-xs font-medium text-navy"
              >
                {s.specialite.nomService}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-sm text-ink-muted">Aucune spécialité renseignée pour le moment.</p>
        )}
        <Link to="/mecanicien/profil" className="mt-3 inline-block text-sm font-semibold text-amber-dark">
          Gérer mes spécialités →
        </Link>
      </Carte>
    </div>
  );
}
