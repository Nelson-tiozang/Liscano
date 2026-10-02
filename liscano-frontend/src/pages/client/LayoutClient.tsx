import { Outlet } from 'react-router';
import { CoquilleApp, type LienNav } from '../../components/layout/CoquilleApp';

function IconeRecherche() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function IconeListe() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

const LIENS: LienNav[] = [
  { to: '/client/recherche', label: 'Trouver un mécanicien', icone: <IconeRecherche /> },
  { to: '/client/demandes', label: 'Mes demandes', icone: <IconeListe /> },
];

export default function LayoutClient() {
  return (
    <CoquilleApp liens={LIENS}>
      <Outlet />
    </CoquilleApp>
  );
}
