import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { demandeApi } from '../../api/demande.api';
import { paiementApi } from '../../api/paiement.api';
import { avisApi } from '../../api/avis.api';
import { messageErreur } from '../../api/client';
import type { Demande, ModePaiement, Paiement } from '../../types';
import {
  Alerte,
  BadgeStatutDemande,
  BadgeStatutPaiement,
  Bouton,
  Carte,
  ChampSelect,
  ChampTextarea,
  Spinner,
} from '../../components/ui/Primitives';

export default function PageDetailDemandeClient() {
  const { id } = useParams<{ id: string }>();
  const [demande, setDemande] = useState<Demande | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    if (!id) return;
    try {
      const d = await demandeApi.obtenir(id);
      setDemande(d);
    } catch (err) {
      setErreur(messageErreur(err, 'Demande introuvable.'));
    } finally {
      setChargement(false);
    }
  }, [id]);

  useEffect(() => {
    charger();
  }, [charger]);

  if (chargement) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (erreur || !demande) {
    return <Alerte>{erreur ?? 'Demande introuvable.'}</Alerte>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/client/demandes" className="text-sm font-medium text-ink-muted hover:text-ink">
        ← Mes demandes
      </Link>

      <div className="mt-3 flex items-start justify-between gap-4">
        <h1 className="font-display text-2xl text-ink">Demande de dépannage</h1>
        <BadgeStatutDemande statut={demande.statut} />
      </div>

      <Carte className="mt-5">
        <p className="text-sm font-medium text-ink">Mécanicien assigné</p>
        <p className="mt-1 text-ink">
          {demande.mecanicien?.utilisateur.prenom} {demande.mecanicien?.utilisateur.nom}
          {demande.mecanicien?.nomGarage ? ` · ${demande.mecanicien.nomGarage}` : ''}
        </p>
        {demande.mecanicien && (
          <a href={`tel:${demande.mecanicien.utilisateur.telephone}`} className="font-mono text-sm text-amber-dark">
            {demande.mecanicien.utilisateur.telephone}
          </a>
        )}

        <hr className="my-4 border-ink/10" />

        <p className="text-sm font-medium text-ink">Description de la panne</p>
        <p className="mt-1 text-sm text-ink-muted">{demande.descriptionPanne}</p>

        {demande.prixConvenu && (
          <>
            <hr className="my-4 border-ink/10" />
            <p className="text-sm font-medium text-ink">Prix convenu</p>
            <p className="font-mono mt-1 text-lg text-ink">{Number(demande.prixConvenu).toLocaleString('fr-FR')} FCFA</p>
          </>
        )}
      </Carte>

      {demande.statut === 'EN_ATTENTE' && <PanneauAnnulation demandeId={demande.id} onAnnule={charger} />}

      {demande.statut === 'TERMINE' && (
        <PanneauPaiement demande={demande} onMisAJour={charger} />
      )}
    </div>
  );
}

function PanneauAnnulation({ demandeId, onAnnule }: { demandeId: string; onAnnule: () => void }) {
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function annuler() {
    if (!confirm('Confirmer l’annulation de cette demande ?')) return;
    setEnCours(true);
    setErreur(null);
    try {
      await demandeApi.annuler(demandeId, 'Annulée par le client depuis l’application.');
      onAnnule();
    } catch (err) {
      setErreur(messageErreur(err, "Impossible d'annuler la demande."));
    } finally {
      setEnCours(false);
    }
  }

  return (
    <Carte className="mt-4">
      <p className="text-sm text-ink-muted">
        En attente de réponse du mécanicien. Tu peux annuler tant qu'il n'a pas encore accepté.
      </p>
      {erreur && (
        <div className="mt-3">
          <Alerte>{erreur}</Alerte>
        </div>
      )}
      <Bouton variante="danger" onClick={annuler} enChargement={enCours} className="mt-3">
        Annuler la demande
      </Bouton>
    </Carte>
  );
}

function PanneauPaiement({ demande, onMisAJour }: { demande: Demande; onMisAJour: () => void }) {
  const [paiement, setPaiement] = useState<Paiement | null>(demande.paiement ?? null);
  const [mode, setMode] = useState<ModePaiement>('MOBILE_MONEY');
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Polling tant que le paiement est en attente (comportement asynchrone du provider mock)
  useEffect(() => {
    if (paiement?.statutPaiement === 'EN_ATTENTE') {
      intervalRef.current = setInterval(async () => {
        try {
          const misAJour = await paiementApi.obtenir(paiement.id);
          setPaiement(misAJour);
          if (misAJour.statutPaiement !== 'EN_ATTENTE' && intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        } catch {
          /* on retentera au prochain tick */
        }
      }, 3000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paiement?.id, paiement?.statutPaiement]);

  async function initierPaiement() {
    setEnCours(true);
    setErreur(null);
    try {
      const reponse = await paiementApi.initier(demande.id, mode);
      setPaiement(reponse.data);
    } catch (err) {
      setErreur(messageErreur(err, "Impossible d'initier le paiement."));
    } finally {
      setEnCours(false);
    }
  }

  if (!paiement) {
    return (
      <Carte className="mt-4">
        <p className="font-display text-lg text-ink">Régler l'intervention</p>
        <p className="mt-1 text-sm text-ink-muted">Choisis un mode de paiement pour finaliser.</p>
        {erreur && (
          <div className="mt-3">
            <Alerte>{erreur}</Alerte>
          </div>
        )}
        <div className="mt-4 flex items-end gap-3">
          <div className="w-56">
            <ChampSelect label="Mode de paiement" value={mode} onChange={(e) => setMode(e.target.value as ModePaiement)}>
              <option value="MOBILE_MONEY">Mobile Money</option>
              <option value="CASH">Espèces</option>
            </ChampSelect>
          </div>
          <Bouton onClick={initierPaiement} enChargement={enCours}>
            Payer maintenant
          </Bouton>
        </div>
      </Carte>
    );
  }

  return (
    <Carte className="mt-4">
      <div className="flex items-center justify-between">
        <p className="font-display text-lg text-ink">Paiement</p>
        <BadgeStatutPaiement statut={paiement.statutPaiement} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
        <dt className="text-ink-muted">Montant total</dt>
        <dd className="font-mono text-right text-ink">{Number(paiement.montantTotal).toLocaleString('fr-FR')} FCFA</dd>
        <dt className="text-ink-muted">Mode</dt>
        <dd className="text-right text-ink">{paiement.modePaiement === 'MOBILE_MONEY' ? 'Mobile Money' : 'Espèces'}</dd>
        {paiement.referenceTransaction && (
          <>
            <dt className="text-ink-muted">Référence</dt>
            <dd className="font-mono text-right text-ink">{paiement.referenceTransaction}</dd>
          </>
        )}
      </dl>

      {paiement.statutPaiement === 'EN_ATTENTE' && paiement.modePaiement === 'MOBILE_MONEY' && (
        <div className="mt-4 flex items-center gap-2 rounded-md bg-amber-light px-3 py-2.5 text-sm text-amber-dark">
          <span className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-amber-dark/40 border-t-amber-dark" />
          En attente de confirmation du provider Mobile Money...
        </div>
      )}
      {paiement.statutPaiement === 'EN_ATTENTE' && paiement.modePaiement === 'CASH' && (
        <div className="mt-4 rounded-md bg-amber-light px-3 py-2.5 text-sm text-amber-dark">
          En attente que le mécanicien confirme la réception des espèces.
        </div>
      )}
      {paiement.statutPaiement === 'ECHOUE' && (
        <div className="mt-4">
          <Alerte>Le paiement a échoué. Contacte le support ou réessaie avec le mécanicien.</Alerte>
        </div>
      )}

      {paiement.statutPaiement === 'PAYE' && <PanneauAvis demande={demande} onMisAJour={onMisAJour} />}
    </Carte>
  );
}

function PanneauAvis({ demande, onMisAJour }: { demande: Demande; onMisAJour: () => void }) {
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoye, setEnvoye] = useState(!!demande.avis);

  async function soumettre() {
    setEnCours(true);
    setErreur(null);
    try {
      await avisApi.creer(demande.id, { note, commentaire: commentaire || undefined });
      setEnvoye(true);
      onMisAJour();
    } catch (err) {
      setErreur(messageErreur(err, "Impossible d'envoyer l'avis."));
    } finally {
      setEnCours(false);
    }
  }

  if (envoye || demande.avis) {
    return (
      <div className="mt-4 rounded-md bg-green-light px-3 py-2.5 text-sm text-green">
        Merci, ton avis a bien été enregistré.
      </div>
    );
  }

  return (
    <div className="mt-5 border-t border-ink/10 pt-4">
      <p className="text-sm font-medium text-ink">Comment s'est passée l'intervention ?</p>
      {erreur && (
        <div className="mt-2">
          <Alerte>{erreur}</Alerte>
        </div>
      )}
      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setNote(n)}
            className={`text-2xl ${n <= note ? 'text-amber' : 'text-ink/20'}`}
            aria-label={`${n} étoiles`}
          >
            ★
          </button>
        ))}
      </div>
      <div className="mt-2">
        <ChampTextarea
          label="Commentaire (optionnel)"
          rows={2}
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
        />
      </div>
      <Bouton onClick={soumettre} enChargement={enCours} className="mt-3">
        Envoyer mon avis
      </Bouton>
    </div>
  );
}
