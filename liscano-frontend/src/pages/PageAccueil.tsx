import { Link } from 'react-router';
import { Bouton } from '../components/ui/Primitives';

export default function PageAccueil() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="hazard-stripe h-1.5 w-full" />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <p className="font-display text-2xl tracking-wide text-ink">LISCANO</p>
        <nav className="flex items-center gap-3">
          <Link to="/connexion" className="text-sm font-semibold text-ink hover:text-amber-dark">
            Se connecter
          </Link>
          <Link to="/inscription/mecanicien" className="text-sm font-semibold text-ink hover:text-amber-dark">
            Je suis mécanicien
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber-dark">
            Panne sur la route de l'Ouest ? On s'occupe de vous.
          </p>
          <h1 className="font-display mt-4 text-5xl leading-[1.05] text-ink md:text-6xl">
            Le mécanicien le plus proche, <span className="text-amber">à un appel près.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-ink-muted">
            Liscano localise les mécaniciens disponibles autour de vous, n'importe où au Cameroun.
            Vous appelez, il intervient, vous payez directement sur l'application.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/inscription/client">
              <Bouton className="px-6 py-3 text-base">Trouver un mécanicien</Bouton>
            </Link>
            <Link to="/inscription/mecanicien">
              <Bouton variante="fantome" className="px-6 py-3 text-base">
                Devenir mécanicien partenaire
              </Bouton>
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-ink/10 bg-surface p-6 shadow-sm">
          <p className="font-display text-lg text-ink">Comment ça marche</p>
          <ol className="mt-4 space-y-4 text-sm text-ink-muted">
            <li className="flex gap-3">
              <span className="font-mono flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber text-xs font-bold text-white">
                1
              </span>
              Décrivez votre panne et votre position — Liscano trouve les mécaniciens disponibles à
              proximité, triés par distance.
            </li>
            <li className="flex gap-3">
              <span className="font-mono flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber text-xs font-bold text-white">
                2
              </span>
              Le mécanicien accepte, se déplace, puis termine l'intervention avec un prix convenu.
            </li>
            <li className="flex gap-3">
              <span className="font-mono flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber text-xs font-bold text-white">
                3
              </span>
              Vous payez directement via Mobile Money ou en espèces, puis laissez un avis.
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}
