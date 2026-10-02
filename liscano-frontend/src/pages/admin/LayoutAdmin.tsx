import { Outlet } from 'react-router';
import { CoquilleApp, type LienNav } from '../../components/layout/CoquilleApp';

function IconeGraphique() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18M7 16v-4M12 16V8M17 16v-8" />
    </svg>
  );
}

function IconeUtilisateurs() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
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
  { to: '/admin', label: 'Vue d’ensemble', icone: <IconeGraphique />, fin: true },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', icone: <IconeUtilisateurs /> },
  { to: '/admin/demandes', label: 'Demandes', icone: <IconeListe /> },
  { to: '/admin/specialites', label: 'Spécialités & admins', icone: <IconeOutils /> },
];

export default function LayoutAdmin() {
  return (
    <CoquilleApp liens={LIENS}>
      <Outlet />
    </CoquilleApp>
  );
}
