import type { ButtonHTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

// --- Boutons ---
type Variante = 'primaire' | 'secondaire' | 'danger' | 'fantome';

const STYLES_VARIANTE: Record<Variante, string> = {
  primaire: 'bg-amber text-white hover:bg-amber-dark disabled:bg-amber/50',
  secondaire: 'bg-navy text-white hover:bg-navy-light disabled:bg-navy/50',
  danger: 'bg-red text-white hover:brightness-110 disabled:bg-red/50',
  fantome: 'bg-transparent text-ink border border-ink/20 hover:bg-ink/5',
};

export function Bouton({
  variante = 'primaire',
  className = '',
  enChargement = false,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante; enChargement?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || enChargement}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold tracking-wide transition-colors disabled:cursor-not-allowed ${STYLES_VARIANTE[variante]} ${className}`}
    >
      {enChargement && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {children}
    </button>
  );
}

// --- Champs de formulaire ---
export function Champ({
  label,
  erreur,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; erreur?: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-ink">{label}</span>
      <input
        {...props}
        className={`rounded-md border bg-surface px-3 py-2.5 text-ink placeholder:text-ink-muted/60 focus:border-amber ${
          erreur ? 'border-red' : 'border-ink/15'
        } ${props.className ?? ''}`}
      />
      {erreur && <span className="text-xs text-red">{erreur}</span>}
    </label>
  );
}

export function ChampTextarea({
  label,
  erreur,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; erreur?: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-ink">{label}</span>
      <textarea
        {...props}
        className={`rounded-md border bg-surface px-3 py-2.5 text-ink placeholder:text-ink-muted/60 focus:border-amber ${
          erreur ? 'border-red' : 'border-ink/15'
        } ${props.className ?? ''}`}
      />
      {erreur && <span className="text-xs text-red">{erreur}</span>}
    </label>
  );
}

export function ChampSelect({
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-ink">{label}</span>
      <select
        {...props}
        className={`rounded-md border border-ink/15 bg-surface px-3 py-2.5 text-ink focus:border-amber ${props.className ?? ''}`}
      >
        {children}
      </select>
    </label>
  );
}

export function LabelChamp(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} className={`text-sm font-medium text-ink ${props.className ?? ''}`} />;
}

// --- Structure ---
export function Carte({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-ink/10 bg-surface p-5 shadow-sm ${className}`}>{children}</div>
  );
}

export function Alerte({ type = 'erreur', children }: { type?: 'erreur' | 'succes' | 'info'; children: ReactNode }) {
  const styles = {
    erreur: 'bg-red-light text-red border-red/30',
    succes: 'bg-green-light text-green border-green/30',
    info: 'bg-amber-light text-amber-dark border-amber/30',
  }[type];
  return <div className={`rounded-md border px-4 py-3 text-sm ${styles}`}>{children}</div>;
}

// --- Badge de statut de demande ---
const STATUTS_DEMANDE: Record<string, { label: string; classe: string; hazard?: boolean }> = {
  EN_ATTENTE: { label: 'En attente', classe: 'bg-amber-light text-amber-dark', hazard: true },
  ACCEPTE: { label: 'Acceptée', classe: 'bg-navy/10 text-navy' },
  EN_COURS: { label: 'En cours', classe: 'bg-navy text-white' },
  TERMINE: { label: 'Terminée', classe: 'bg-green-light text-green' },
  ANNULE: { label: 'Annulée', classe: 'bg-red-light text-red' },
};

export function BadgeStatutDemande({ statut }: { statut: string }) {
  const info = STATUTS_DEMANDE[statut] ?? { label: statut, classe: 'bg-ink/10 text-ink' };
  return (
    <span
      className={`relative inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${info.classe}`}
    >
      {info.hazard && <span className="h-1.5 w-1.5 rounded-full bg-amber-dark" />}
      {info.label}
    </span>
  );
}

const STATUTS_PAIEMENT: Record<string, { label: string; classe: string }> = {
  EN_ATTENTE: { label: 'En attente', classe: 'bg-amber-light text-amber-dark' },
  PAYE: { label: 'Payé', classe: 'bg-green-light text-green' },
  ECHOUE: { label: 'Échoué', classe: 'bg-red-light text-red' },
  REVERSE: { label: 'Reversé', classe: 'bg-navy/10 text-navy' },
};

export function BadgeStatutPaiement({ statut }: { statut: string }) {
  const info = STATUTS_PAIEMENT[statut] ?? { label: statut, classe: 'bg-ink/10 text-ink' };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${info.classe}`}>
      {info.label}
    </span>
  );
}

// --- Chip de distance — élément signature (pastille + point pulsant) ---
export function ChipDistance({ km }: { km: number }) {
  return (
    <span className="font-mono inline-flex items-center gap-1.5 rounded-full border border-navy/15 bg-navy/5 px-2.5 py-1 text-xs font-medium text-navy">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green" />
      </span>
      {km.toFixed(km < 10 ? 2 : 1)} km
    </span>
  );
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-6 w-6 animate-spin rounded-full border-2 border-ink/15 border-t-amber ${className}`}
      role="status"
      aria-label="Chargement"
    />
  );
}

export function EtatVide({ titre, description }: { titre: string; description?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-ink/20 px-6 py-12 text-center">
      <p className="font-display text-lg text-ink">{titre}</p>
      {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
    </div>
  );
}

export function Etoiles({ note }: { note: number }) {
  return (
    <span className="text-amber" aria-label={`${note} sur 5`}>
      {'★'.repeat(Math.round(note))}
      <span className="text-ink/20">{'★'.repeat(5 - Math.round(note))}</span>
    </span>
  );
}
