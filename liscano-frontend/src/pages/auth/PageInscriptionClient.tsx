import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { messageErreur } from '../../api/client';
import { Alerte, Bouton, Carte, Champ } from '../../components/ui/Primitives';

export default function PageInscriptionClient() {
  const { inscrireClient } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nom: '', prenom: '', telephone: '', motDePasse: '' });
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    setErreur(null);
    setEnCours(true);
    try {
      await inscrireClient(form);
      navigate('/client/recherche');
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
          <h1 className="font-display text-xl text-ink">Créer un compte client</h1>
          <p className="mt-1 text-sm text-ink-muted">Trouvez un mécanicien en quelques secondes.</p>
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
              label="Mot de passe"
              type="password"
              placeholder="8 caractères minimum"
              value={form.motDePasse}
              onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
              required
              minLength={8}
            />
            <Bouton type="submit" enChargement={enCours} className="mt-2 w-full">
              Créer mon compte
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
