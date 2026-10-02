import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { messageErreur } from '../../api/client';
import { obtenirPositionActuelle, type Position } from '../../utils/geolocation';
import { Alerte, Bouton, Carte, Champ } from '../../components/ui/Primitives';

export default function PageInscriptionMecanicien() {
  const { inscrireMecanicien } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nom: '', prenom: '', telephone: '', motDePasse: '', nomGarage: '' });
  const [position, setPosition] = useState<Position | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [localisationEnCours, setLocalisationEnCours] = useState(false);

  async function localiser() {
    setErreur(null);
    setLocalisationEnCours(true);
    try {
      setPosition(await obtenirPositionActuelle());
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Localisation impossible.');
    } finally {
      setLocalisationEnCours(false);
    }
  }

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    setErreur(null);

    if (!position) {
      setErreur('Indique la position de ton garage avant de continuer.');
      return;
    }

    setEnCours(true);
    try {
      await inscrireMecanicien({ ...form, ...position });
      navigate('/mecanicien/tableau-de-bord');
    } catch (err) {
      setErreur(messageErreur(err, "L'inscription a échoué."));
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-sm">
        <Link to="/" className="font-display mb-8 block text-center text-2xl text-ink">
          LISCANO
        </Link>
        <Carte>
          <h1 className="font-display text-xl text-ink">Devenir mécanicien partenaire</h1>
          <p className="mt-1 text-sm text-ink-muted">Recevez des demandes de dépannage près de vous.</p>
          <form onSubmit={soumettre} className="mt-5 flex flex-col gap-4">
            {erreur && <Alerte>{erreur}</Alerte>}
            <div className="grid grid-cols-2 gap-3">
              <Champ
                label="Prénom"
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                required
              />
              <Champ
                label="Nom"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                required
              />
            </div>
            <Champ
              label="Numéro de téléphone"
              type="tel"
              placeholder="612345678"
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              required
            />
            <Champ
              label="Nom du garage (optionnel)"
              value={form.nomGarage}
              onChange={(e) => setForm({ ...form, nomGarage: e.target.value })}
            />
            <Champ
              label="Mot de passe"
              type="password"
              placeholder="8 caractères minimum"
              value={form.motDePasse}
              onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
              required
              minLength={8}
            />

            <div className="rounded-md border border-ink/10 bg-surface-alt p-3">
              <p className="text-sm font-medium text-ink">Position du garage</p>
              {position ? (
                <p className="font-mono mt-1 text-xs text-green">
                  ✓ {position.latitude.toFixed(4)}, {position.longitude.toFixed(4)}
                </p>
              ) : (
                <p className="mt-1 text-xs text-ink-muted">Requis pour apparaître dans les recherches.</p>
              )}
              <Bouton
                type="button"
                variante="fantome"
                onClick={localiser}
                enChargement={localisationEnCours}
                className="mt-2 w-full text-xs"
              >
                {position ? 'Actualiser ma position' : 'Utiliser ma position actuelle'}
              </Bouton>
            </div>

            <Bouton type="submit" enChargement={enCours} className="mt-2 w-full">
              Créer mon compte mécanicien
            </Bouton>
          </form>
        </Carte>
        <p className="mt-5 text-center text-sm text-ink-muted">
          Déjà un compte ?{' '}
          <Link to="/connexion" className="font-semibold text-amber-dark">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
