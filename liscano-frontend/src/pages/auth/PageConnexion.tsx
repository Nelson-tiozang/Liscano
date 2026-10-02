import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { messageErreur } from '../../api/client';
import { Alerte, Bouton, Carte, Champ } from '../../components/ui/Primitives';

const ACCUEIL_PAR_ROLE: Record<string, string> = {
  CLIENT: '/client/recherche',
  MECANICIEN: '/mecanicien/tableau-de-bord',
  ADMINISTRATEUR: '/admin',
};

export default function PageConnexion() {
  const { connexion } = useAuth();
  const navigate = useNavigate();
  const [telephone, setTelephone] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    setErreur(null);
    setEnCours(true);
    try {
      const role = await connexion(telephone, motDePasse);
      navigate(ACCUEIL_PAR_ROLE[role] ?? '/');
    } catch (err) {
      setErreur(messageErreur(err, 'Numéro ou mot de passe incorrect.'));
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="font-display mb-8 block text-center text-2xl text-ink">
          LISCANO
        </Link>
        <Carte>
          <h1 className="font-display text-xl text-ink">Connexion</h1>
          <form onSubmit={soumettre} className="mt-5 flex flex-col gap-4">
            {erreur && <Alerte>{erreur}</Alerte>}
            <Champ
              label="Numéro de téléphone"
              type="tel"
              placeholder="612345678"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              required
            />
            <Champ
              label="Mot de passe"
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
            />
            <Bouton type="submit" enChargement={enCours} className="mt-2 w-full">
              Se connecter
            </Bouton>
          </form>
        </Carte>
        <p className="mt-5 text-center text-sm text-ink-muted">
          Pas encore de compte ?{' '}
          <Link to="/inscription/client" className="font-semibold text-amber-dark">
            Créer un compte client
          </Link>{' '}
          ou{' '}
          <Link to="/inscription/mecanicien" className="font-semibold text-amber-dark">
            devenir mécanicien
          </Link>
        </p>
      </div>
    </div>
  );
}
