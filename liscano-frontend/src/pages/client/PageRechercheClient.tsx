import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { mecanicienApi } from '../../api/mecanicien.api';
import { demandeApi } from '../../api/demande.api';
import { messageErreur } from '../../api/client';
import { obtenirPositionActuelle, POSITION_YAOUNDE, type Position } from '../../utils/geolocation';
import type { MecanicienProche, Specialite } from '../../types';
import {
  Alerte,
  Bouton,
  Carte,
  ChampSelect,
  ChampTextarea,
  ChipDistance,
  Etoiles,
  EtatVide,
  Spinner,
} from '../../components/ui/Primitives';

export default function PageRechercheClient() {
  const navigate = useNavigate();
  const [position, setPosition] = useState<Position | null>(null);
  const [specialites, setSpecialites] = useState<Specialite[]>([]);
  const [specialiteId, setSpecialiteId] = useState<string>('');
  const [resultats, setResultats] = useState<MecanicienProche[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [mecanicienChoisi, setMecanicienChoisi] = useState<MecanicienProche | null>(null);

  useEffect(() => {
    mecanicienApi.listerSpecialites().then(setSpecialites).catch(() => {});
    initialiser();
  }, []);

  async function initialiser() {
    setChargement(true);
    setErreur(null);
    let pos: Position;
    try {
      pos = await obtenirPositionActuelle();
    } catch (err) {
      setErreur(`${err instanceof Error ? err.message : ''} Position par défaut utilisée (Yaoundé).`.trim());
      pos = POSITION_YAOUNDE;
    }
    setPosition(pos);
    await rechercher(pos, specialiteId);
  }

  async function rechercher(pos: Position, specId: string) {
    setChargement(true);
    try {
      const reponse = await mecanicienApi.rechercherProches({
        latitude: pos.latitude,
        longitude: pos.longitude,
        rayonKm: 30,
        specialiteId: specId ? Number(specId) : undefined,
      });
      setResultats(reponse.data);
    } catch (err) {
      setErreur(messageErreur(err, 'Recherche impossible.'));
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl text-ink">Mécaniciens à proximité</h1>
      <p className="mt-1 text-ink-muted">Choisis un mécanicien disponible pour envoyer ta demande.</p>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div className="w-56">
          <ChampSelect
            label="Filtrer par spécialité"
            value={specialiteId}
            onChange={(e) => {
              setSpecialiteId(e.target.value);
              if (position) rechercher(position, e.target.value);
            }}
          >
            <option value="">Toutes les spécialités</option>
            {specialites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nomService}
              </option>
            ))}
          </ChampSelect>
        </div>
        <Bouton variante="fantome" onClick={initialiser}>
          Actualiser ma position
        </Bouton>
      </div>

      {erreur && (
        <div className="mt-4">
          <Alerte type="info">{erreur}</Alerte>
        </div>
      )}

      <div className="mt-6">
        {chargement ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : resultats.length === 0 ? (
          <EtatVide
            titre="Aucun mécanicien disponible à proximité"
            description="Élargis ta recherche ou réessaie dans quelques minutes."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {resultats.map((m) => (
              <li key={m.id}>
                <Carte className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-display text-lg text-ink">
                        {m.prenom} {m.nom}
                      </p>
                      {m.estVerifie && (
                        <span className="rounded-full bg-green-light px-2 py-0.5 text-xs font-semibold text-green">
                          Vérifié
                        </span>
                      )}
                    </div>
                    {m.nomGarage && <p className="text-sm text-ink-muted">{m.nomGarage}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <ChipDistance km={m.distanceKm} />
                      <span className="text-sm">
                        <Etoiles note={m.noteMoyenne} />
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`tel:${m.telephone}`}
                      className="inline-flex items-center justify-center rounded-md border border-ink/15 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-ink/5"
                    >
                      Appeler
                    </a>
                    <Bouton onClick={() => setMecanicienChoisi(m)}>Envoyer une demande</Bouton>
                  </div>
                </Carte>
              </li>
            ))}
          </ul>
        )}
      </div>

      {mecanicienChoisi && position && (
        <FormulaireDemande
          mecanicien={mecanicienChoisi}
          position={position}
          onFerme={() => setMecanicienChoisi(null)}
          onCree={(id) => navigate(`/client/demandes/${id}`)}
        />
      )}
    </div>
  );
}

function FormulaireDemande({
  mecanicien,
  position,
  onFerme,
  onCree,
}: {
  mecanicien: MecanicienProche;
  position: Position;
  onFerme: () => void;
  onCree: (id: string) => void;
}) {
  const [description, setDescription] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function soumettre() {
    if (description.trim().length < 10) {
      setErreur('Décris la panne en au moins 10 caractères.');
      return;
    }
    setEnCours(true);
    setErreur(null);
    try {
      const demande = await demandeApi.creer({
        mecanicienId: mecanicien.id,
        latitudePanne: position.latitude,
        longitudePanne: position.longitude,
        descriptionPanne: description,
      });
      onCree(demande.id);
    } catch (err) {
      setErreur(messageErreur(err, 'Impossible de créer la demande.'));
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-ink/40 p-4 sm:items-center" onClick={onFerme}>
      <div className="w-full max-w-md rounded-lg bg-surface p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-xl text-ink">
          Demande à {mecanicien.prenom} {mecanicien.nom}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          {mecanicien.distanceKm.toFixed(2)} km de ta position actuelle.
        </p>
        <div className="mt-4">
          {erreur && (
            <div className="mb-3">
              <Alerte>{erreur}</Alerte>
            </div>
          )}
          <ChampTextarea
            label="Décris la panne"
            rows={4}
            placeholder="Ex : le moteur ne démarre plus, bruit anormal au freinage..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Bouton variante="fantome" onClick={onFerme}>
            Annuler
          </Bouton>
          <Bouton onClick={soumettre} enChargement={enCours}>
            Envoyer la demande
          </Bouton>
        </div>
      </div>
    </div>
  );
}
