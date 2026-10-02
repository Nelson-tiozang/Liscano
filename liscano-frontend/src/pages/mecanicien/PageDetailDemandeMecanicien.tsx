import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { demandeApi } from '../../api/demande.api';
import { paiementApi } from '../../api/paiement.api';
import { messageErreur } from '../../api/client';
import type { Demande } from '../../types';
import {
  Alerte,
  BadgeStatutDemande,
  BadgeStatutPaiement,
  Bouton,
  Carte,
  Champ,
  Spinner,
} from '../../components/ui/Primitives';

export default function PageDetailDemandeMecanicien() {
  const { id } = useParams<{ id: string }>();
  const [demande, setDemande] = useState<Demande | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreurChargement, setErreurChargement] = useState<string | null>(null);
  const [erreurAction, setErreurAction] = useState<string | null>(null);
  const [actionEnCours, setActionEnCours] = useState<string | null>(null);
  const [prixConvenu, setPrixConvenu] = useState('');

  const charger = useCallback(async () => {
    if (!id) return;
    try {
      const d = await demandeApi.obtenir(id);
      setDemande(d);
    } catch (err) {
      setErreurChargement(messageErreur(err, 'Demande introuvable.'));
    } finally {
      setChargement(false);
    }
  }, [id]);

  useEffect(() => {
    charger();
  }, [charger]);

  async function executer(nom: string, action: () => Promise<unknown>) {
    setActionEnCours(nom);
    setErreurAction(null);
    try {
      await action();
      await charger();
    } catch (err) {
      setErreurAction(messageErreur(err, 'Action impossible.'));
    } finally {
      setActionEnCours(null);
    }
  }

  if (chargement) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (erreurChargement || !demande) {
    return <Alerte>{erreurChargement ?? 'Demande introuvable.'}</Alerte>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/mecanicien/demandes" className="text-sm font-medium text-ink-muted hover:text-ink">
        ← Demandes reçues
      </Link>

      <div className="mt-3 flex items-start justify-between gap-4">
        <h1 className="font-display text-2xl text-ink">Demande de dépannage</h1>
        <BadgeStatutDemande statut={demande.statut} />
      </div>

      {erreurAction && (
        <div className="mt-4">
          <Alerte>{erreurAction}</Alerte>
        </div>
      )}

      <Carte className="mt-4">
        <p className="text-sm font-medium text-ink">Client</p>
        <p className="mt-1 text-ink">
          {demande.client?.utilisateur.prenom} {demande.client?.utilisateur.nom}
        </p>
        {demande.client && (
          <a href={`tel:${demande.client.utilisateur.telephone}`} className="font-mono text-sm text-amber-dark">
            {demande.client.utilisateur.telephone}
          </a>
        )}

        <hr className="my-4 border-ink/10" />
        <p className="text-sm font-medium text-ink">Description de la panne</p>
        <p className="mt-1 text-sm text-ink-muted">{demande.descriptionPanne}</p>

        <hr className="my-4 border-ink/10" />
        <p className="text-sm font-medium text-ink">Position de la panne</p>
        <a
          href={`https://www.google.com/maps?q=${demande.latitudePanne},${demande.longitudePanne}`}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-sm text-amber-dark"
        >
          {demande.latitudePanne.toFixed(5)}, {demande.longitudePanne.toFixed(5)} — voir sur la carte
        </a>
      </Carte>

      {demande.statut === 'EN_ATTENTE' && (
        <Carte className="mt-4">
          <p className="text-sm font-medium text-ink">Que veux-tu faire de cette demande ?</p>
          <div className="mt-3 flex gap-2">
            <Bouton
              enChargement={actionEnCours === 'accepter'}
              onClick={() => executer('accepter', () => demandeApi.accepter(demande.id))}
            >
              Accepter
            </Bouton>
            <Bouton
              variante="danger"
              enChargement={actionEnCours === 'refuser'}
              onClick={() =>
                executer('refuser', () => demandeApi.refuser(demande.id, 'Refusée depuis le tableau de bord.'))
              }
            >
              Refuser
            </Bouton>
          </div>
        </Carte>
      )}

      {demande.statut === 'ACCEPTE' && (
        <Carte className="mt-4">
          <p className="text-sm text-ink-muted">Demande acceptée. Démarre l'intervention une fois sur place.</p>
          <Bouton
            className="mt-3"
            enChargement={actionEnCours === 'demarrer'}
            onClick={() => executer('demarrer', () => demandeApi.demarrer(demande.id))}
          >
            Démarrer l'intervention
          </Bouton>
        </Carte>
      )}

      {demande.statut === 'EN_COURS' && (
        <Carte className="mt-4">
          <p className="text-sm font-medium text-ink">Terminer l'intervention</p>
          <p className="mt-1 text-sm text-ink-muted">Indique le prix convenu avec le client.</p>
          <div className="mt-3 flex items-end gap-3">
            <div className="w-40">
              <Champ
                label="Prix (FCFA)"
                type="number"
                min={1}
                value={prixConvenu}
                onChange={(e) => setPrixConvenu(e.target.value)}
              />
            </div>
            <Bouton
              enChargement={actionEnCours === 'terminer'}
              onClick={() => {
                const montant = Number(prixConvenu);
                if (!montant || montant <= 0) {
                  setErreurAction('Indique un prix valide.');
                  return;
                }
                executer('terminer', () => demandeApi.terminer(demande.id, montant));
              }}
            >
              Terminer l'intervention
            </Bouton>
          </div>
        </Carte>
      )}

      {demande.statut === 'TERMINE' && demande.paiement && (
        <Carte className="mt-4">
          <div className="flex items-center justify-between">
            <p className="font-display text-lg text-ink">Paiement</p>
            <BadgeStatutPaiement statut={demande.paiement.statutPaiement} />
          </div>
          <p className="font-mono mt-2 text-sm text-ink">
            {Number(demande.paiement.montantTotal).toLocaleString('fr-FR')} FCFA — ta part :{' '}
            {Number(demande.paiement.partMecanicien).toLocaleString('fr-FR')} FCFA
          </p>

          {demande.paiement.modePaiement === 'CASH' && demande.paiement.statutPaiement === 'EN_ATTENTE' && (
            <Bouton
              className="mt-3"
              enChargement={actionEnCours === 'confirmer-cash'}
              onClick={() =>
                executer('confirmer-cash', () => paiementApi.confirmerCash(demande.paiement!.id))
              }
            >
              Confirmer réception des espèces
            </Bouton>
          )}
          {demande.paiement.modePaiement === 'MOBILE_MONEY' && demande.paiement.statutPaiement === 'EN_ATTENTE' && (
            <p className="mt-3 text-sm text-ink-muted">En attente de confirmation Mobile Money du client.</p>
          )}
        </Carte>
      )}

      {demande.statut === 'TERMINE' && !demande.paiement && (
        <Carte className="mt-4">
          <p className="text-sm text-ink-muted">En attente que le client initie le paiement.</p>
        </Carte>
      )}
    </div>
  );
}
