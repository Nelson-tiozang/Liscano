import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin.api';
import { messageErreur } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import type { Role, StatutCompte, Utilisateur } from '../../types';
import { Alerte, Bouton, Carte, ChampSelect, EtatVide, Spinner } from '../../components/ui/Primitives';

const STYLE_STATUT: Record<StatutCompte, string> = {
  ACTIF: 'bg-green-light text-green',
  SUSPENDU: 'bg-amber-light text-amber-dark',
  BANNI: 'bg-red-light text-red',
};

export default function PageUtilisateursAdmin() {
  const { utilisateur: moi } = useAuth();
  const [role, setRole] = useState<Role | ''>('');
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState<string | null>(null);

  useEffect(() => {
    charger();
  }, [role]);

  function charger() {
    adminApi
      .listerUtilisateurs({ role: role || undefined, limite: 50 })
      .then((r) => setUtilisateurs(r.data))
      .catch((err) => setErreur(messageErreur(err)));
  }

  async function changerStatut(id: string, statutCompte: StatutCompte) {
    setEnCours(id);
    setErreur(null);
    try {
      await adminApi.modifierStatutCompte(id, statutCompte);
      charger();
    } catch (err) {
      setErreur(messageErreur(err, 'Action impossible.'));
    } finally {
      setEnCours(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-ink">Utilisateurs</h1>
        <div className="w-52">
          <ChampSelect label="" value={role} onChange={(e) => setRole(e.target.value as Role | '')}>
            <option value="">Tous les rôles</option>
            <option value="CLIENT">Clients</option>
            <option value="MECANICIEN">Mécaniciens</option>
            <option value="ADMINISTRATEUR">Administrateurs</option>
          </ChampSelect>
        </div>
      </div>

      {erreur && (
        <div className="mt-4">
          <Alerte>{erreur}</Alerte>
        </div>
      )}

      {utilisateurs === null ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : utilisateurs.length === 0 ? (
        <div className="mt-6">
          <EtatVide titre="Aucun utilisateur trouvé" />
        </div>
      ) : (
        <Carte className="mt-6 !p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {utilisateurs.map((u) => (
                <tr key={u.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">
                    {u.prenom} {u.nom}
                  </td>
                  <td className="font-mono px-4 py-3 text-ink-muted">{u.telephone}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STYLE_STATUT[u.statutCompte]}`}>
                      {u.statutCompte}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.id === moi?.id ? (
                      <span className="text-xs text-ink-muted">— ton compte —</span>
                    ) : (
                      <div className="flex justify-end gap-2">
                        {u.statutCompte !== 'ACTIF' && (
                          <Bouton
                            variante="fantome"
                            className="px-2.5 py-1 text-xs"
                            enChargement={enCours === u.id}
                            onClick={() => changerStatut(u.id, 'ACTIF')}
                          >
                            Réactiver
                          </Bouton>
                        )}
                        {u.statutCompte !== 'SUSPENDU' && (
                          <Bouton
                            variante="fantome"
                            className="px-2.5 py-1 text-xs"
                            enChargement={enCours === u.id}
                            onClick={() => changerStatut(u.id, 'SUSPENDU')}
                          >
                            Suspendre
                          </Bouton>
                        )}
                        {u.statutCompte !== 'BANNI' && (
                          <Bouton
                            variante="danger"
                            className="px-2.5 py-1 text-xs"
                            enChargement={enCours === u.id}
                            onClick={() => changerStatut(u.id, 'BANNI')}
                          >
                            Bannir
                          </Bouton>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Carte>
      )}
    </div>
  );
}
