import { Outlet } from 'react-router';
import { CoquilleApp, type LienNav } from '../../components/layout/CoquilleApp';

function IconeTableau() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
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

function IconeOutils() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

const LIENS: LienNav[] = [
  { to: '/mecanicien/tableau-de-bord', label: 'Tableau de bord', icone: <IconeTableau /> },
  { to: '/mecanicien/demandes', label: 'Demandes reçues', icone: <IconeListe /> },
  { to: '/mecanicien/profil', label: 'Mes spécialités', icone: <IconeOutils /> },
];

export default function LayoutMecanicien() {
  return (
    <CoquilleApp liens={LIENS}>
      <Outlet />
    </CoquilleApp>
  );
}
