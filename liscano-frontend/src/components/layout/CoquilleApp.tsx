import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import { useAuth } from '../../context/AuthContext';

export interface LienNav {
  to: string;
  label: string;
  icone: ReactNode;
  fin?: boolean;
}

const ETIQUETTE_ROLE: Record<string, string> = {
  CLIENT: 'Espace client',
  MECANICIEN: 'Espace mécanicien',
  ADMINISTRATEUR: 'Espace admin',
};

export function CoquilleApp({ liens, children }: { liens: LienNav[]; children: ReactNode }) {
  const { utilisateur, role, deconnexion } = useAuth();

  return (
    <div className="min-h-screen bg-bg">
      <div className="hazard-stripe h-1.5 w-full" />

      <div className="mx-auto flex max-w-7xl">
        {/* Barre latérale */}
        <aside className="sticky top-1.5 hidden h-[calc(100vh-6px)] w-64 shrink-0 flex-col bg-navy text-white md:flex">
          <div className="px-6 py-6">
            <p className="font-display text-2xl tracking-wide">LISCANO</p>
            <p className="mt-0.5 text-xs uppercase tracking-widest text-white/50">
              {role ? ETIQUETTE_ROLE[role] : ''}
            </p>
          </div>

          <nav className="flex-1 space-y-1 px-3">
            {liens.map((lien) => (
              <NavLink
                key={lien.to}
                to={lien.to}
                end={lien.fin}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-amber text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {lien.icone}
                {lien.label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-white/10 px-6 py-4">
            <p className="truncate text-sm font-medium">
              {utilisateur?.prenom} {utilisateur?.nom}
            </p>
            <p className="font-mono text-xs text-white/50">{utilisateur?.telephone}</p>
            <button
              onClick={deconnexion}
              className="mt-3 text-xs font-semibold uppercase tracking-wide text-amber hover:text-amber-dark"
            >
              Se déconnecter
            </button>
          </div>
        </aside>

        {/* Contenu */}
        <div className="min-w-0 flex-1">
          {/* Barre mobile */}
          <div className="flex items-center justify-between border-b border-ink/10 bg-surface px-4 py-3 md:hidden">
            <p className="font-display text-xl">LISCANO</p>
            <button onClick={deconnexion} className="text-xs font-semibold uppercase text-amber">
              Déconnexion
            </button>
          </div>

          {/* Nav mobile horizontale */}
          <nav className="flex gap-1 overflow-x-auto border-b border-ink/10 bg-surface px-3 py-2 md:hidden">
            {liens.map((lien) => (
              <NavLink
                key={lien.to}
                to={lien.to}
                end={lien.fin}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${
                    isActive ? 'bg-amber text-white' : 'text-ink-muted'
                  }`
                }
              >
                {lien.label}
              </NavLink>
            ))}
          </nav>

          <main className="p-4 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
