import { useEffect, useState } from 'react';
import { mecanicienApi } from '../../api/mecanicien.api';
import { messageErreur } from '../../api/client';
import type { Mecanicien, Specialite } from '../../types';
import { Alerte, Bouton, Carte, Spinner } from '../../components/ui/Primitives';

export default function PageProfilMecanicien() {
  const [profil, setProfil] = useState<Mecanicien | null>(null);
  const [toutes, setToutes] = useState<Specialite[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState<number | null>(null);

  useEffect(() => {
    charger();
  }, []);

  async function charger() {
    setChargement(true);
    try {
      const [p, s] = await Promise.all([mecanicienApi.obtenirMonProfil(), mecanicienApi.listerSpecialites()]);
      setProfil(p);
      setToutes(s);
    } catch (err) {
      setErreur(messageErreur(err));
    } finally {
      setChargement(false);
    }
  }

  const idsActives = new Set((profil?.specialites ?? []).map((s) => s.specialite.id));

  async function basculer(specialiteId: number, active: boolean) {
    setEnCours(specialiteId);
    setErreur(null);
    try {
      if (active) {
        await mecanicienApi.retirerSpecialite(specialiteId);
      } else {
        await mecanicienApi.ajouterSpecialites([specialiteId]);
      }
      await charger();
    } catch (err) {
      setErreur(messageErreur(err, 'Action impossible.'));
    } finally {
      setEnCours(null);
    }
  }

  if (chargement) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl text-ink">Mes spécialités</h1>
      <p className="mt-1 text-ink-muted">
        Sélectionne les types d'interventions que tu proposes. Elles servent à filtrer les recherches clients.
      </p>

      {erreur && (
        <div className="mt-4">
          <Alerte>{erreur}</Alerte>
        </div>
      )}

      <Carte className="mt-6">
        <ul className="divide-y divide-ink/10">
          {toutes.map((s) => {
            const active = idsActives.has(s.id);
            return (
              <li key={s.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{s.nomService}</p>
                  {s.description && <p className="text-xs text-ink-muted">{s.description}</p>}
                </div>
                <Bouton
                  variante={active ? 'danger' : 'primaire'}
                  enChargement={enCours === s.id}
                  onClick={() => basculer(s.id, active)}
                  className="px-3 py-1.5 text-xs"
                >
                  {active ? 'Retirer' : 'Ajouter'}
                </Bouton>
              </li>
            );
          })}
        </ul>
        {toutes.length === 0 && <p className="text-sm text-ink-muted">Aucune spécialité définie par la plateforme.</p>}
      </Carte>
    </div>
  );
}
