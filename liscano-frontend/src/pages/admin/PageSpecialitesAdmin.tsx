import { useEffect, useState, type FormEvent } from 'react';
import { mecanicienApi } from '../../api/mecanicien.api';
import { authApi } from '../../api/auth.api';
import { messageErreur } from '../../api/client';
import type { Specialite } from '../../types';
import { Alerte, Bouton, Carte, Champ } from '../../components/ui/Primitives';

export default function PageSpecialitesAdmin() {
  const [specialites, setSpecialites] = useState<Specialite[]>([]);
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [suppressionEnCours, setSuppressionEnCours] = useState<number | null>(null);

  useEffect(() => {
    charger();
  }, []);

  function charger() {
    mecanicienApi.listerSpecialites().then(setSpecialites);
  }

  async function creer(e: FormEvent) {
    e.preventDefault();
    setEnCours(true);
    setErreur(null);
    try {
      await mecanicienApi.creerSpecialite({ nomService: nom, description: description || undefined });
      setNom('');
      setDescription('');
      charger();
    } catch (err) {
      setErreur(messageErreur(err, 'Création impossible.'));
    } finally {
      setEnCours(false);
    }
  }

  async function supprimer(id: number) {
    setSuppressionEnCours(id);
    try {
      await mecanicienApi.supprimerSpecialite(id);
      charger();
    } catch (err) {
      setErreur(messageErreur(err, 'Suppression impossible.'));
    } finally {
      setSuppressionEnCours(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl text-ink">Spécialités</h1>

      {erreur && (
        <div className="mt-4">
          <Alerte>{erreur}</Alerte>
        </div>
      )}

      <Carte className="mt-6">
        <p className="text-sm font-medium text-ink">Ajouter une spécialité</p>
        <form onSubmit={creer} className="mt-3 flex flex-wrap items-end gap-3">
          <div className="w-48">
            <Champ label="Nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
          </div>
          <div className="flex-1">
            <Champ label="Description (optionnel)" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <Bouton type="submit" enChargement={enCours}>
            Ajouter
          </Bouton>
        </form>
      </Carte>

      <Carte className="mt-4 !p-0">
        <ul className="divide-y divide-ink/10">
          {specialites.map((s) => (
            <li key={s.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-ink">{s.nomService}</p>
                {s.description && <p className="text-xs text-ink-muted">{s.description}</p>}
              </div>
              <Bouton
                variante="danger"
                className="px-2.5 py-1 text-xs"
                enChargement={suppressionEnCours === s.id}
                onClick={() => supprimer(s.id)}
              >
                Supprimer
              </Bouton>
            </li>
          ))}
          {specialites.length === 0 && (
            <li className="px-5 py-6 text-center text-sm text-ink-muted">Aucune spécialité pour le moment.</li>
          )}
        </ul>
      </Carte>

      <FormulaireNouvelAdmin />
    </div>
  );
}

function FormulaireNouvelAdmin() {
  const [form, setForm] = useState({ nom: '', prenom: '', telephone: '', motDePasse: '' });
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    setEnCours(true);
    setErreur(null);
    setSucces(null);
    try {
      const reponse = await authApi.inscrireAdministrateur(form);
      setSucces(reponse.message || 'Administrateur créé.');
      setForm({ nom: '', prenom: '', telephone: '', motDePasse: '' });
    } catch (err) {
      setErreur(messageErreur(err, 'Création impossible.'));
    } finally {
      setEnCours(false);
    }
  }

  return (
    <Carte className="mt-8">
      <p className="font-display text-lg text-ink">Créer un nouvel administrateur</p>
      <p className="mt-1 text-sm text-ink-muted">Réservé aux administrateurs déjà connectés.</p>
      <form onSubmit={soumettre} className="mt-4 flex flex-col gap-3">
        {erreur && <Alerte>{erreur}</Alerte>}
        {succes && <Alerte type="succes">{succes}</Alerte>}
        <div className="grid grid-cols-2 gap-3">
          <Champ label="Prénom" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required />
          <Champ label="Nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
        </div>
        <Champ
          label="Téléphone"
          type="tel"
          value={form.telephone}
          onChange={(e) => setForm({ ...form, telephone: e.target.value })}
          required
        />
        <Champ
          label="Mot de passe"
          type="password"
          minLength={8}
          value={form.motDePasse}
          onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
          required
        />
        <Bouton type="submit" enChargement={enCours} className="self-start">
          Créer l'administrateur
        </Bouton>
      </form>
    </Carte>
  );
}
